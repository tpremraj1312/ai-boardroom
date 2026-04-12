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
    // AI Ad Execution Engine — Campaign tracking
    campaigns: [{
        platform: { type: String, enum: ['meta', 'google'], required: true },
        campaignId: { type: String },
        adSetId: { type: String },
        adId: { type: String },
        creativeId: { type: String },
        name: { type: String },
        budget: {
            daily: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            currency: { type: String, default: 'USD' }
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'paused', 'completed', 'error'],
            default: 'draft'
        },
        performance: {
            impressions: { type: Number, default: 0 },
            clicks: { type: Number, default: 0 },
            ctr: { type: Number, default: 0 },
            conversions: { type: Number, default: 0 },
            spend: { type: Number, default: 0 },
            cpc: { type: Number, default: 0 },
            roas: { type: Number, default: 0 }
        },
        lastSynced: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    adConfig: {
        totalBudget: { type: Number, default: 100 },
        budgetSplit: {
            meta: { type: Number, default: 60 },
            google: { type: Number, default: 40 }
        },
        autoOptimize: { type: Boolean, default: true },
        targetAudience: { type: String, default: '' },
        objective: { type: String, default: 'conversions' }
    },
    version: { type: Number, default: 1 },
    // Walkthrough Agent — post-build documentation
    walkthrough: { type: mongoose.Schema.Types.Mixed, default: null },
    // Validation Pipeline — self-check report
    validationReport: { type: mongoose.Schema.Types.Mixed, default: null },
    // Debugger Agent — auto-fix log
    debugLog: [{ type: mongoose.Schema.Types.Mixed }],
    // IDE — recently opened files for quick-open
    lastOpenedFiles: [{ type: String }],
    // IDE — terminal/build log entries (capped at last 200)
    terminalLogs: [{
        type: { type: String, enum: ['info', 'warn', 'error', 'success', 'system'], default: 'info' },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    // IDE — per-project editor settings
    settings: {
        fontSize: { type: Number, default: 13 },
        wordWrap: { type: String, default: 'on' },
        minimap: { type: Boolean, default: false },
        tabSize: { type: Number, default: 2 }
    }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
