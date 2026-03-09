import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { uploadDocument, getSessionDocuments } from '../controllers/documentController.js';

const router = express.Router();

// Memory storage for immediate processing
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/session/:sessionId', protect, getSessionDocuments);

export default router;
