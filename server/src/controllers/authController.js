import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

export const register = async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, persona: user.persona },
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, persona: user.persona, teamId: user.teamId },
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) { next(error); }
};

export const googleCallback = (req, res) => {
    // Handled conceptually - usually would be handled by Passport.js and redirected with JWT
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GoogleAuthNotFullyImplementedForV2`);
};
