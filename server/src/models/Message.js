import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    agentRole: { type: String, enum: ['CEO', 'CFO', 'CTO', 'CMO', 'INVESTOR', 'SYSTEM', 'USER'], required: true },
    content: { type: String, required: true },
    phase: { type: String, enum: ['analysis', 'debate', 'cross-examination', 'verdict'], required: true },
    round: { type: Number, default: 1 },
    isFollowUp: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);
