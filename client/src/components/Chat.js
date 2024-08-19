import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import UserList from './UserList';
import ChatBox from './ChatBox';

function Chat({ user }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:4000');

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    // Emit login event when component mounts
    newSocket.emit('login', user.id);

    return () => {
      newSocket.disconnect();
    };
  }, [user.id]);

  const fetchMessages = async (receiverId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/messages/${user.id}/${receiverId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Welcome, {user.username}</h2>
      <UserList socket={socket} fetchMessages={fetchMessages} />
      <ChatBox socket={socket} user={user} messages={messages} loading={loading} />
    </div>
  );
}

export default Chat;
