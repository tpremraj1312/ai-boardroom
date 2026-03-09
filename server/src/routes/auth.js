import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { register, login, getMe, googleCallback } from '../controllers/authController.js';

const router = express.Router();

// Validation middlewares
const registerValidation = [
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
];

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.get('/google/callback', googleCallback);

export default router;
