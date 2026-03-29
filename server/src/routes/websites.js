import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getWebsites,
    getWebsiteById,
    generateWebsite,
    updateWebsite,
    deployWebsite
} from '../controllers/websiteController.js';

const router = express.Router();

router.route('/')
    .get(protect, getWebsites)
    .post(protect, generateWebsite);

router.route('/:id')
    .get(protect, getWebsiteById)
    .put(protect, updateWebsite);

router.post('/:id/deploy', protect, deployWebsite);

export default router;
