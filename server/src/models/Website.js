import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    brandKit: {
        primaryColor: { type: String, default: '#3b82f6' },
        secondaryColor: { type: String, default: '#1e40af' },
        logoUrl: { type: String, default: '' },
    },
    content: {
        hero: {
            title: String,
            subtitle: String,
            ctaText: String,
            imageUrl: String
        },
        features: [{
            title: String,
            description: String,
            icon: String
        }],
        testimonials: [{
            quote: String,
            author: String,
            role: String
        }],
        ctaSection: {
            title: String,
            subtitle: String,
            buttonText: String
        },
        footer: {
            text: String,
            links: [String]
        }
    },
    deployedUrl: { type: String, default: null },
    vercelDeploymentId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Website', websiteSchema);
