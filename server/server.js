import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './src/app.js';
import { initBoardroomSocket } from './src/sockets/boardroomSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

initBoardroomSocket(io);

// Start server
server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);