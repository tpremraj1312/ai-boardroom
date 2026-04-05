import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './src/app.js';
import { initBoardroomSocket } from './src/sockets/boardroomSocket.js';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-boardroom')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Create HTTP Server
const server = http.createServer(app);

// Init Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'https://ai-boardroom-fawn.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Register sockets
initBoardroomSocket(io);

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log('CORS Origin:', process.env.CORS_ORIGIN);
});