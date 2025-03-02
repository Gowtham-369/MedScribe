# chat_app.py
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    api_key = request.args.get('apiKey')
    if api_key:
        join_room(api_key)
        print(f"Client with API Key {api_key} connected and joined room {api_key}")
        emit('message', {'sender': 'server', 'text': f'Welcome, user {api_key}!'})
    else:
        print("Client connected without an API Key")

@socketio.on('send_message')
def handle_send_message(data):
    print(f"Received message: {data}")
    receiver = data.get('receiver')
    if receiver:
        emit('message', data, room=receiver)
    else:
        emit('message', data, broadcast=True)

@socketio.on('offer')
def handle_offer(data):
    receiver = data.get('to')
    if receiver:
        emit('offer', data, room=receiver)

@socketio.on('answer')
def handle_answer(data):
    receiver = data.get('to')
    if receiver:
        emit('answer', data, room=receiver)

@socketio.on('candidate')
def handle_candidate(data):
    receiver = data.get('to')
    if receiver:
        emit('candidate', data, room=receiver)

@socketio.on('end_chat')
def handle_end_chat(data):
    conversation = data.get('conversation', [])
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    file_name = f'conversation_{timestamp}.txt'
    with open(file_name, 'w') as f:
        for msg in conversation:
            f.write(f"{msg.get('sender')}: {msg.get('text')}\n")
    print(f"Conversation saved to {file_name}")
    emit('chat_ended', {'message': 'Chat has ended and conversation saved.'}, broadcast=True)

if __name__ == '__main__':
    # Running on port 5000
    socketio.run(app, host="0.0.0.0", port=5002, debug=True)