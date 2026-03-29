import Project from '../models/Project.js';
import { generateAdImage } from '../services/imageService.js';
import { generateAdVideo } from '../services/videoService.js';
import { buildCreativePrompt } from '../services/prompts/creativePromptBuilder.js';

const getAuthQuery = (req, projectId) => {
    const query = { _id: projectId };
    if (req.user && req.user.teamId) {
        query.$or = [{ user: req.user._id }, { team: req.user.teamId }];
    } else {
        query.user = req.user._id;
    }
    return query;
};

// ── GENERATE IMAGE CREATIVE ──
export const generateImageCreative = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { template, style, designSettings, contentDetails, customPrompt } = req.body;

        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Compile optimized marketing prompt with all panel data
        const engineeredPrompt = buildCreativePrompt(
            {
                name: contentDetails?.productName || project.name,
                description: contentDetails?.description || project.prompt,
                targetAudience: contentDetails?.targetAudience || 'General Consumers'
            },
            template || 'Instagram Post',
            style || 'Modern SaaS',
            project.brandKit,
            designSettings || {},
            contentDetails || {}
        );

        // Append any custom user prompt
        const finalPrompt = customPrompt
            ? `${engineeredPrompt}\n\nAdditional user instructions: ${customPrompt}`
            : engineeredPrompt;

        // Call DALL-E 3 Service
        const imageUrl = await generateAdImage(finalPrompt, template, style);

        // Save into MongoDB with enriched metadata
        const creativeData = {
            type: 'image',
            url: imageUrl,
            prompt: finalPrompt,
            style,
            template,
            category: contentDetails?.category || '',
            adType: contentDetails?.adType || '',
            designSettings: designSettings || {}
        };

        const updatedProject = await Project.findOneAndUpdate(
            { _id: id },
            { $push: { creatives: creativeData } },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (err) {
        console.error('[CREATIVE CONTROLLER] Image Error:', err);
        next(err);
    }
};

// ── GENERATE VIDEO CREATIVE ──
export const generateVideoCreative = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { template, style, designSettings, contentDetails, customPrompt } = req.body;

        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const videoScript = buildCreativePrompt(
            {
                name: contentDetails?.productName || project.name,
                description: contentDetails?.description || project.prompt,
                targetAudience: contentDetails?.targetAudience || 'General Consumers'
            },
            template || 'YouTube/TikTok Ad',
            style || 'Cyberpunk',
            project.brandKit,
            designSettings || {},
            contentDetails || {}
        );

        const finalPrompt = customPrompt
            ? `${videoScript}\n\nAdditional user instructions: ${customPrompt}`
            : videoScript;

        // Call Runway Service
        const videoUrl = await generateAdVideo(finalPrompt, template, style);

        const creativeData = {
            type: 'video',
            url: videoUrl,
            prompt: finalPrompt,
            style,
            template,
            category: contentDetails?.category || '',
            adType: contentDetails?.adType || '',
            designSettings: designSettings || {}
        };

        const updatedProject = await Project.findOneAndUpdate(
            { _id: id },
            { $push: { creatives: creativeData } },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (err) {
        console.error('[CREATIVE CONTROLLER] Video Error:', err);
        next(err);
    }
};

// ── UPDATE BRAND KIT ──
export const updateBrandKit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { brandKit } = req.body;

        const updatedProject = await Project.findOneAndUpdate(
            getAuthQuery(req, id),
            { brandKit },
            { new: true }
        );

        res.status(200).json(updatedProject);
    } catch (err) {
        next(err);
    }
};
