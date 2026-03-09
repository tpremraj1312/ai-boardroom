import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    title: { type: String, default: 'Untitled Session' },
    problemStatement: { type: String, required: true },
    userType: { type: String },
    inputData: { type: mongoose.Schema.Types.Mixed },
    targetCustomers: { type: String },
    revenueModel: { type: String },
    keyConstraints: { type: String },
    industry: { type: String },
    stage: { type: String },
    status: { type: String, enum: ['init', 'in_progress', 'completed', 'error', 'analyzing', 'debating'], default: 'init' },

    agentsOutput: [{
        agentRole: { type: String },
        content: { type: String },
        structuredData: { type: mongoose.Schema.Types.Mixed },
        phase: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    agentMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

    finalVerdict: { type: String },
    dashboardData: { type: mongoose.Schema.Types.Mixed },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
