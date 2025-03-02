import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const processType = import.meta.env.VITE_PROCESS_TYPE; // e.g., "A" or "B"

let senderKey, receiverKey;

if (processType === 'A') {
  // Process A: Use fallback defaults of 456 for sender and 789 for receiver
  senderKey = '789';
  receiverKey = '456';
} else {
  // Process B (or any other value): Use fallback defaults of 789 for sender and 456 for receiver
  senderKey = '456';
  receiverKey = '789';
}

console.log(senderKey);
console.log(receiverKey);

// Connect to the Flask backend and pass the senderKey as a query parameter
const socket = io('http://localhost:5000', {
  query: { apiKey: senderKey }
});

function TalkToPhysician({ role }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatEnded, setChatEnded] = useState(false);

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    // Listen for the "chat_ended" event from the server
    socket.on('chat_ended', (data) => {
      alert(data.message); // e.g., "Chat has ended and conversation saved."
      setChatEnded(true);
      socket.disconnect(); // Disconnect the socket for this client
    });

    return () => {
      socket.off('message');
      socket.off('chat_ended');
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || chatEnded) return;

    const messageData = {
      sender: senderKey,
      receiver: receiverKey,
      text: input,
    };

    // Emit the message to the server
    socket.emit('send_message', messageData);
    setMessages(prevMessages => [...prevMessages, messageData]);
    setInput('');
  };

  const handleVideoCall = () => {
    if (chatEnded) return;
    alert('Starting video call...');
  };

  const handleEndChat = () => {
    if (chatEnded) return;
    // Emit "end_chat" event with the entire conversation history
    socket.emit('end_chat', { conversation: messages });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{`Talk to ${role === 'patient'?'Physician':'Patient'}`}</h1>
      <div className="bg-white p-4 rounded shadow mb-4 flex flex-col h-96">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === senderKey ? 'text-right' : 'text-left'}
            >
              <span className="font-semibold">
                {msg.sender === "server" ? "" : msg.sender}
              </span>
              {msg.sender === "server" ? `${msg.text}` : `: ${msg.text}`}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            disabled={chatEnded}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleSend}
            disabled={chatEnded}
          >
            Send
          </button>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={handleVideoCall}
          disabled={chatEnded}
        >
          Start Video Call
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={handleEndChat}
          disabled={chatEnded}
        >
          End Chat
        </button>
      </div>
    </div>
  );
}

export default TalkToPhysician;
