import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { createTeam, getMyTeam, inviteMember } from '../controllers/teamController.js';

const router = express.Router();

router.post('/', protect, [
    body('name', 'Team name is required').not().isEmpty().trim().escape()
], createTeam);

router.get('/my-team', protect, getMyTeam);

router.post('/invite', protect, [
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('role', 'Valid role required').optional().isIn(['editor', 'viewer'])
], inviteMember);

export default router;
