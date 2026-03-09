import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';

const router = express.Router();

// Get all user sessions
router.get('/', protect, async (req, res, next) => {
    try {
        const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) { next(error); }
});

// Create new session
router.post('/', protect, async (req, res, next) => {
    try {
        const { userType, inputData } = req.body;
        const session = await Session.create({
            userId: req.user._id,
            teamId: req.user.teamId,
            title: inputData?.businessName || 'Untitled Session',
            problemStatement: inputData?.description || inputData?.goals || 'Strategic Review',
            industry: inputData?.industry,
            stage: inputData?.stage,
            userType,
            inputData,
            dashboardData: { inputData, userType }
        });
        res.status(201).json(session);
    } catch (error) { next(error); }
});

// Get session by share token (public)
router.get('/shared/:token', async (req, res, next) => {
    try {
        const session = await Session.findOne({ shareToken: req.params.token, isPublic: true }).populate('agentMessages');
        if (!session) return res.status(404).json({ message: 'Session not found or private.' });
        res.json(session);
    } catch (error) { next(error); }
});

export default router;
