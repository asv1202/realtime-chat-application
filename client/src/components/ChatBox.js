import React, { useState } from 'react';

function ChatBox({ socket, user, messages }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (socket && message.trim()) {
      const receiverId = prompt('Enter the receiver ID:');
      socket.emit('private_message', {
        senderId: user.id,
        receiverId,
        message,
      });
      setMessage('');
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
