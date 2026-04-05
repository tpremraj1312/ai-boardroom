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
    exportProjectZip,
    getProjectWalkthrough,
    regenerateWalkthrough,
    revalidateProject,
    rerunDebugger
} from '../controllers/projectController.js';
import { generateImageCreative, generateVideoCreative, updateBrandKit } from '../controllers/creativeController.js';
import {
    publishAd,
    getCampaignStats,
    updateCampaign,
    optimizeNow,
    getGrowthSuggestions,
    updateAdConfig
} from '../controllers/campaignController.js';

const router = express.Router();

// Project CRUD
router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById);

// AI Pipeline (Stages 1-5)
router.post('/:id/generate-blueprint', protect, generateProjectBlueprint);
router.post('/:id/generate-code', protect, generateProjectCode);

// Chat & Edit
router.post('/:id/chat', protect, chatProject);
router.put('/:id/files', protect, saveFile);

// Orchestrator Agents (Individual re-runs)
router.get('/:id/walkthrough', protect, getProjectWalkthrough);
router.post('/:id/walkthrough/regenerate', protect, regenerateWalkthrough);
router.post('/:id/validate', protect, revalidateProject);
router.post('/:id/debug', protect, rerunDebugger);

// Deploy & Export
router.post('/:id/deploy', protect, deployProject);
router.get('/:id/export', protect, exportProjectZip);

// AI Ad Creative Studio
router.post('/:id/creatives/image', protect, generateImageCreative);
router.post('/:id/creatives/video', protect, generateVideoCreative);
router.put('/:id/brandKit', protect, updateBrandKit);

// AI Ad Execution Engine
router.post('/:id/publish-ad', protect, publishAd);
router.get('/:id/campaign-stats', protect, getCampaignStats);
router.patch('/:id/campaigns/:campaignId', protect, updateCampaign);
router.post('/:id/optimize', protect, optimizeNow);
router.get('/:id/growth-suggestions', protect, getGrowthSuggestions);
router.put('/:id/ad-config', protect, updateAdConfig);

export default router;
