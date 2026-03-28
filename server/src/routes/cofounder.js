import express from 'express';
import { protect } from '../middleware/auth.js';
import { processQuestionnaire, chatWithCoFounder } from '../services/coFounderService.js';
import CoFounderMemory from '../models/CoFounderMemory.js';

const router = express.Router();

/**
 * @route   GET /api/co-founder/memory
 * @desc    Get the user's co-founder memory/status
 * @access  Private
 */
router.get('/memory', protect, async (req, res) => {
    try {
        const memory = await CoFounderMemory.findOne({ userId: req.user._id });
        res.json(memory || { status: 'new' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/co-founder/questionnaire
 * @desc    Submit the psychological questionnaire
 * @access  Private
 */
router.post('/questionnaire', protect, async (req, res) => {
    try {
        const memory = await processQuestionnaire(req.user._id, req.body.answers);
        res.json(memory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/co-founder/chat
 * @desc    Chat with the AI Co-Founder
 * @access  Private
 */
router.post('/chat', protect, async (req, res) => {
    const { message, isResearch } = req.body;
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        await chatWithCoFounder({
            userId: req.user._id,
            message,
            isResearch,
            onChunk: (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
        });
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

export default router;
