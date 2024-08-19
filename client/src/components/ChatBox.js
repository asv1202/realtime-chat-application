import React, { useState } from 'react';

function ChatBox({ socket, user, messages }) {
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const handleSendMessage = () => {
    if (socket && message.trim()) {
        const receiverId = prompt('Enter the receiver ID:');
        if (receiverId) {
            socket.emit('private_message', {
                senderId: user.id,
                receiverId,
                message,
            });
            setMessage('');
        }
    }
};


  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            {msg.senderId === user.id ? 'You' : 'Them'}: {msg.message}
          </p>
        ))}
      </div>
      <div>
        <label>
          Receiver ID:
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            placeholder="Enter receiver ID"
          />
        </label>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;
