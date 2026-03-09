import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Not authorized. No token provided.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token.' });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired. Please login again.' });
        next(error);
    }
};
