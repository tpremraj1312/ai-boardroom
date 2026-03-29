import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getProjects,
    getProjectById,
    createProject,
    generateProjectBlueprint,
    generateProjectCode,
    chatProject,
    saveFile,
    deployProject,
    exportProjectZip
} from '../controllers/projectController.js';

const router = express.Router();

// Project CRUD
router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById);

// AI Pipeline
router.post('/:id/generate-blueprint', protect, generateProjectBlueprint);
router.post('/:id/generate-code', protect, generateProjectCode);

// Chat & Edit
router.post('/:id/chat', protect, chatProject);
router.put('/:id/files', protect, saveFile);

// Deploy & Export
router.post('/:id/deploy', protect, deployProject);
router.get('/:id/export', protect, exportProjectZip);

export default router;
