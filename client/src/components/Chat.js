import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import UserList from './UserList';
import ChatBox from './ChatBox';

function Chat({ user }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.emit('login', user.id);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(`http://localhost:4000/messages/${user.id}/${receiverId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div>
      <h2>Welcome, {user.username}</h2>
      <UserList socket={socket} fetchMessages={fetchMessages} />
      <ChatBox socket={socket} user={user} messages={messages} />
    </div>
  );
}

export default Chat;
