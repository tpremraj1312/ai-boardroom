import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    // AI-generated blueprint (Step 1)
    blueprint: { type: mongoose.Schema.Types.Mixed, default: null },
    // Virtual File System — Key: file path, Value: file content string
    fileSystem: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Project lifecycle status
    status: {
        type: String,
        enum: ['idle', 'generating-blueprint', 'generating-code', 'ready', 'deploying', 'deployed', 'error'],
        default: 'idle'
    },
    // Vercel deployment URL
    deployedUrl: { type: String, default: null },
    // User-selected theme for the generated app
    theme: { type: String, default: 'modern' },
    // Chat History
    messages: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    // AI Ad Creative Studio — Enhanced schema
    creatives: [{
        type: { type: String, enum: ['image', 'video'], required: true },
        url: { type: String, required: true },
        prompt: { type: String },
        style: { type: String },
        template: { type: String },
        category: { type: String, default: '' },
        adType: { type: String, default: '' },
        designSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now }
    }],
    brandKit: {
        logoUrl: { type: String, default: '' },
        colors: [{ type: String }],
        fonts: [{ type: String }]
    },
    version: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
