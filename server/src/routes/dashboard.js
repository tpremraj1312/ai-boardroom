import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';

const router = express.Router();

// Get dashboard data
router.get('/:id', protect, async (req, res, next) => {
    try {
        const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ dashboardData: session.dashboardData, verdict: session.verdict });
    } catch (error) { next(error); }
});

export default router;
