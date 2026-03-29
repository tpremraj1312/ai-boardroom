import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    // Virtual File System Map
    // Key: File path (e.g. 'server/index.js'), Value: File content as String
    fileSystem: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Chat History
    messages: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    version: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
