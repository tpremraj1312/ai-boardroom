import mongoose from 'mongoose';

const coFounderMemorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Deep psychological profile from questionnaire
    psychology: {
        riskProfile: { type: String },
        founderType: { type: String },
        decisionStyle: { type: String },
        leadershipStyle: { type: String },
        strengths: [String],
        weaknesses: [String],
        blindSpots: [String],
        motivation: { type: String },
        communicationPreference: { type: String },
        stressResponse: { type: String },
        idealCofounderTone: { type: String },
        personaSummary: { type: String },
        rawAnswers: mongoose.Schema.Types.Mixed
    },

    // AI interaction persona
    persona: {
        tone: { type: String, default: 'professional' },
        focusArea: { type: String },
        historicalContext: { type: String, default: '' }
    },

    // Key insights extracted from conversations
    keyInsights: [{
        topic: String,
        insight: String,
        createdAt: { type: Date, default: Date.now }
    }],

    // Deep research history
    researchHistory: [{
        query: String,
        summary: String,
        sources: [String],
        createdAt: { type: Date, default: Date.now }
    }],

    // Full chat history for context
    chatHistory: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        isResearch: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('CoFounderMemory', coFounderMemorySchema);
