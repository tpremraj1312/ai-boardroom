import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    textContent: { type: String }, // Storing text for basic retrieval or debugging
    embeddings: { type: [Number] }, // The vector array from Gemini
    chunkIndex: { type: Number, default: 0 } // if we split large docs
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
