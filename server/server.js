const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Database connection
const sequelize = new Sequelize('chat-app', 'postgres', 'Atharva@2037', {
    host: 'localhost',
    dialect: 'postgres'
});

// Define User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Define Message model
const Message = sequelize.define('Message', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
});

// Sync models with the database
sequelize.sync();

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt with:', { username, password });

        const user = await User.findOne({ where: { username, password } });

        if (user) {
            console.log('User found:', user);
            res.status(200).json({ id: user.id, username: user.username });
        } else {
            console.log('No matching user found');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch messages between users
app.get('/messages/:userId/:receiverId', async (req, res) => {
    const { userId, receiverId } = req.params;

    try {
        const messages = await Message.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { senderId: userId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: userId }
                ]
            },
            order: [['timestamp', 'ASC']]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const usersOnline = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', (userId) => {
        usersOnline[userId] = socket.id;
        io.emit('users_online', Object.keys(usersOnline));
    });

    socket.on('private_message', async ({ senderId, receiverId, message }) => {
        try {
            await Message.create({ senderId, receiverId, message });
            const receiverSocketId = usersOnline[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('private_message', { senderId, message });
            }
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        for (let userId in usersOnline) {
            if (usersOnline[userId] === socket.id) {
                delete usersOnline[userId];
                io.emit('users_online', Object.keys(usersOnline));
                break;
            }
        }
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
