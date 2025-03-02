// TalkToPhysician.jsx
import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const processType = import.meta.env.VITE_PROCESS_TYPE;

let senderKey, receiverKey;
if (processType === 'A') {
  senderKey = '789';
  receiverKey = '456';
} else {
  senderKey = '456';
  receiverKey = '789';
}

// Connect to chat_app running on port 5002
const socket = io('http://localhost:5002', {
  query: { apiKey: senderKey }
});

function TalkToPhysician({ role }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatEnded, setChatEnded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [peer, setPeer] = useState(null);

  // Refs for video elements and local stream
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Socket event handlers
  useEffect(() => {
    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });
    socket.on('chat_ended', (data) => {
      alert(data.message);
      setChatEnded(true);
      socket.disconnect();
    });
    return () => {
      socket.off('message');
      socket.off('chat_ended');
    };
  }, []);

  // Initialize PeerJS and get local media stream for video call
  useEffect(() => {
    // Using default PeerJS cloud server
    const newPeer = new Peer(senderKey);
    setPeer(newPeer);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.onloadedmetadata = () => {
            localVideoRef.current.play().catch(err =>
              console.error("Error playing local video:", err)
            );
          };
        }
        // Answer incoming calls with our local stream
        newPeer.on('call', call => {
          call.answer(stream);
          call.on('stream', remoteStream => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.onloadedmetadata = () => {
                remoteVideoRef.current.play().catch(err =>
                  console.error("Error playing remote video:", err)
                );
              };
            }
          });
        });
      })
      .catch(err => console.error('Failed to get local stream', err));

    return () => {
      newPeer.destroy();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || chatEnded) return;
    const messageData = {
      sender: senderKey,
      receiver: receiverKey,
      text: input,
    };
    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setInput('');
  };

  // Initiate a call using the existing local stream
  const startCall = () => {
    if (!peer) return;
    const stream = localStreamRef.current;
    if (!stream) {
      console.error("Local stream not available for call.");
      return;
    }
    const call = peer.call(receiverKey, stream);
    call.on('stream', remoteStream => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(err =>
            console.error("Error playing remote video:", err)
          );
        };
      }
    });
  };

  // End the call: stop local media, clear video elements, and destroy peer connection
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
  };

  // Start audio recording using the audio tracks from the existing local stream
  const startRecording = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.error("Local stream not available for recording.");
      return;
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error("No audio tracks available for recording.");
      return;
    }
    // Create a new MediaStream with just the audio tracks
    const audioStream = new MediaStream(audioTracks);
    let mimeType = 'audio/webm; codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.error("No supported MIME type for MediaRecorder.");
        return;
      }
    }
    const recorder = new MediaRecorder(audioStream, { mimeType });
    let chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      try {
        const res = await fetch('http://localhost:5001/save-audio', { method: 'POST', body: formData });
        const responseText = await res.text();
        alert(responseText);
      } catch (err) {
        console.error('Error uploading audio:', err);
      }
      // After recording stops and upload completes, end the call
      endCall();
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  // Stop audio recording manually (if desired)
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // End chat separately (if needed)
  const handleEndChat = () => {
    if (chatEnded) return;
    socket.emit('end_chat', { conversation: messages });
    // Optionally, also end the call
    endCall();
    setChatEnded(true);
  };

  return (
    
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        {`Talk to ${role === 'patient' ? 'Physician' : 'Patient'}`}
      </h1>

      {/* Video Call Section */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex space-x-4">
          <video ref={localVideoRef} className="w-1/2 border" muted />
          <video ref={remoteVideoRef} className="w-1/2 border" />
        </div>
        <div className="mt-4 flex space-x-2">
          <button onClick={startCall} className="bg-green-600 text-white px-4 py-2 rounded">
            Start Call
          </button>
          <button
            onClick={startRecording}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={recording}
          >
            Start Recording Audio
          </button>
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={!recording}
          >
            Stop Recording Audio
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white p-4 rounded shadow mb-4 flex flex-col h-96">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === senderKey ? 'text-right' : 'text-left'}>
              <span className="font-semibold">
                {msg.sender === 'server' ? '' : msg.sender}
              </span>
              {msg.sender === 'server' ? `${msg.text}` : `: ${msg.text}`}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            disabled={chatEnded}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={chatEnded}>
            Send
          </button>
        </div>
      </div>
      <div className="flex space-x-2">
        <button onClick={handleEndChat} className="bg-red-600 text-white px-4 py-2 rounded" disabled={chatEnded}>
          End Chat
        </button>
      </div>
    </div>
  );
}

export default TalkToPhysician;
