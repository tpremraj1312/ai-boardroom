import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getProjects,
    getProjectById,
    createProject,
    chatProject,
    exportProjectZip
} from '../controllers/projectController.js';

const router = express.Router();

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById);

router.post('/:id/chat', protect, chatProject);
router.get('/:id/export', protect, exportProjectZip);

export default router;
