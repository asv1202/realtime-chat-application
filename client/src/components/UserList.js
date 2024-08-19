import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function UserList({ user }) {
    const [usersOnline, setUsersOnline] = useState([]);
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Emit login event when the user logs in
        socket.emit('login', user.id);

        // Listen for online users
        socket.on('users_online', (users) => {
            // Filter out the current user from the list of online users
            setUsersOnline(users.filter(id => parseInt(id) !== user.id));
        });

        // Listen for incoming private messages
        socket.on('private_message', ({ senderId, message }) => {
            // Add incoming messages to the message list
            setMessages(prevMessages => [...prevMessages, { senderId, message }]);
        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.off();
        };
    }, [user.id]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (receiverId && message.trim()) {
            // Emit the private_message event with the senderId, receiverId, and message
            socket.emit('private_message', {
                senderId: user.id,
                receiverId,
                message
            });
            // Clear the message input after sending
            setMessage('');
            // Add the sent message to the local message list
            setMessages(prevMessages => [...prevMessages, { senderId: user.id, message }]);
        }
    };

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
