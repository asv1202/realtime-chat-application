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

sequelize.sync();

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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Log incoming credentials
        console.log('Login attempt with:', { username, password });

        const user = await User.findOne({ where: { username, password } });

        // Check if user is found
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


app.get('/messages/:userId/:receiverId', async (req, res) => {
    const { userId, receiverId } = req.params;
    try {
        const messages = await Message.findAll({
            where: {
                senderId: [userId, receiverId],
                receiverId: [userId, receiverId]
            },
            order: [['timestamp', 'ASC']]
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', async (userId) => {
        socket.userId = userId;
        io.emit('users_online', userId);
    });

    socket.on('private_message', async ({ senderId, receiverId, message }) => {
        try {
            await Message.create({ senderId, receiverId, message });
            const receiverSocketId = io.sockets.sockets.get(usersOnline[receiverId]);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('private_message', { senderId, message });
            }
        } catch (error) {
            console.log('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
