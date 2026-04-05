import Document from '../models/Document.js';
import { generateEmbeddings, chunkText } from '../ai/rag.js';

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No document provided' });
        }

        const { sessionId, teamId } = req.body;
        let textContent = '';

        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            // Lazy import to avoid @napi-rs/canvas crash on Vercel serverless
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            let pdfParse;
            try {
                pdfParse = require('pdf-parse');
            } catch (e) {
                return res.status(500).json({ message: 'PDF parsing is not available in this environment.' });
            }
            const pdfData = await pdfParse(req.file.buffer);
            textContent = pdfData.text;
        } else if (req.file.mimetype.includes('text') || req.file.mimetype === 'application/json') {
            textContent = req.file.buffer.toString('utf-8');
        } else {
            return res.status(400).json({ message: 'Unsupported file type. Please upload PDF or Text documents.' });
        }

        // Process structured chunks and generate embeddings
        const chunks = chunkText(textContent);
        const docsToSave = [];

        for (let i = 0; i < Math.min(chunks.length, 5); i++) {
            const vector = await generateEmbeddings(chunks[i]);
            docsToSave.push({
                userId: req.user._id,
                sessionId: sessionId || null,
                teamId: teamId || null,
                fileName: req.file.originalname + `_part${i + 1}`,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                textContent: chunks[i],
                embeddings: vector,
                chunkIndex: i
            });
        }

        const savedDocs = await Document.insertMany(docsToSave);

        res.status(201).json({
            message: 'Document processed and embedded successfully',
            documents: savedDocs.map(d => ({ id: d._id, fileName: d.fileName }))
        });

    } catch (error) {
        next(error);
    }
};

export const getSessionDocuments = async (req, res, next) => {
    try {
        const docs = await Document.find({ sessionId: req.params.sessionId })
            .select('-embeddings')
            .sort({ chunkIndex: 1 });

        res.json(docs);
    } catch (error) {
        next(error);
    }
};

