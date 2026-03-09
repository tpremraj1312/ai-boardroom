import jwt from 'jsonwebtoken';
import { runBoardroomDebate, runFollowUpRound } from '../services/agentOrchestrator.js';
import Session from '../models/Session.js';

export const initBoardroomSocket = (io) => {
    // Auth middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id} (user: ${socket.userId})`);

        socket.on('join:session', ({ sessionId }) => {
            socket.join(`session:${sessionId}`);
            socket.currentSessionId = sessionId;
            console.log(`[Socket] User ${socket.userId} joined session ${sessionId}`);
        });

        socket.on('start:debate', async ({ sessionId }) => {
            console.log(`[Socket] start:debate received for session ${sessionId}`);
            try {
                const session = await Session.findOne({ _id: sessionId, userId: socket.userId });
                if (!session) {
                    console.error(`[Socket] Session ${sessionId} not found for user ${socket.userId}`);
                    return socket.emit('debate:error', { message: 'Session not found' });
                }
                if (session.status === 'complete') {
                    return socket.emit('debate:error', { message: 'Debate already completed' });
                }

                const socketEmitter = (event, data) => {
                    io.to(`session:${sessionId}`).emit(event, data);
                };

                console.log(`[Socket] Launching debate for session ${sessionId}...`);
                await runBoardroomDebate({ session, socketEmitter });
            } catch (error) {
                console.error(`[Socket] Debate failed for session ${sessionId}:`, error.message);
                socket.emit('debate:error', { message: 'Debate failed: ' + error.message });
            }
        });

        socket.on('send:followup', async ({ sessionId, question }) => {
            try {
                const session = await Session.findOne({ _id: sessionId, userId: socket.userId });
                if (!session) return;

                const socketEmitter = (event, data) => io.to(`session:${sessionId}`).emit(event, data);
                await runFollowUpRound({ session, question, socketEmitter });
            } catch (error) {
                console.error(`[Socket] Follow-up failed:`, error.message);
                socket.emit('debate:error', { message: 'Follow-up failed: ' + error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });
};
