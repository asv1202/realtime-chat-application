import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function UserList({ user }) {
    const [usersOnline, setUsersOnline] = useState([]);
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState(null);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user || !user.id) {
            console.error('User is not defined or user.id is missing');
            return;
        }

        // Initialize socket connection
        socketRef.current = io('http://localhost:4000');
        const socket = socketRef.current;

        // Emit login event when the user logs in
        socket.emit('login', user.id);

        // Listen for online users
        socket.on('users_online', (users) => {
            setUsersOnline(users.filter(id => parseInt(id) !== user.id));
        });

        // Listen for incoming private messages
        socket.on('private_message', ({ senderId, message }) => {
            setMessages(prevMessages => [...prevMessages, { senderId, message }]);
        });

        // Cleanup socket connection on component unmount
        return () => {
            socket.off('users_online');
            socket.off('private_message');
            socket.disconnect();
        };
    }, [user]);

    const sendMessage = (e) => {
        e.preventDefault();
        const socket = socketRef.current;
        if (!user || !user.id) {
            console.error('User is not defined or user.id is missing');
            return;
        }
        if (receiverId && message.trim()) {
            socket.emit('private_message', {
                senderId: user.id,
                receiverId,
                message
            });
            setMessage('');
            setMessages(prevMessages => [...prevMessages, { senderId: user.id, message }]);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Welcome, {user.username}</h2>
            <h3>Online Users</h3>
            <ul>
                {usersOnline.map((id) => (
                    <li 
                        key={id} 
                        onClick={() => setReceiverId(parseInt(id))} 
                        style={{ cursor: 'pointer', color: receiverId === parseInt(id) ? 'blue' : 'black' }}
                    >
                        User {id}
                    </li>
                ))}
            </ul>
            <div>
                <form onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        placeholder="Type a message"
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
            <div>
                <h3>Messages</h3>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.senderId === user.id ? 'You' : `User ${msg.senderId}`}:</strong> {msg.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserList;
