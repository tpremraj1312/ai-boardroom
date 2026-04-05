import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { initBoardroomSocket } from './src/sockets/boardroomSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// ─── For local development: start HTTP server + Socket.io ───
if (process.env.NODE_ENV !== 'production') {
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST'],
        },
    });

    initBoardroomSocket(io);

    server.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );
}

// ─── For Vercel serverless: export the Express app ───
export default app;