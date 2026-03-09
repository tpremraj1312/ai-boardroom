import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' }
    }],
    invites: [{
        email: { type: String },
        role: { type: String },
        token: { type: String },
        expiresAt: { type: Date }
    }]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
