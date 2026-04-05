import Project from '../models/Project.js';
import { publishAd as publishAdService, syncCampaignStats, updateCampaignStatus, updateCampaignBudget } from '../services/campaignService.js';
import { analyzeAndOptimize, getGrowthSuggestions as getGrowthSuggestionsService } from '../services/optimizationService.js';

// Helper: auth-scoped query
const getAuthQuery = (req, projectId) => {
    const query = { _id: projectId };
    if (req.user && req.user.teamId) {
        query.$or = [{ user: req.user._id }, { team: req.user.teamId }];
    } else {
        query.user = req.user._id;
    }
    return query;
};

// ── POST /projects/:id/publish-ad ──────────────────────────────
export const publishAd = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const result = await publishAdService(id, req.user._id);
        res.status(200).json(result);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Publish Error:', err.message);
        next(err);
    }
};

// ── GET /projects/:id/campaign-stats ───────────────────────────
export const getCampaignStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const stats = await syncCampaignStats(id);
        res.status(200).json(stats);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Stats Error:', err.message);
        next(err);
    }
};

// ── PATCH /projects/:id/campaigns/:campaignId ──────────────────
export const updateCampaign = async (req, res, next) => {
    try {
        const { id, campaignId } = req.params;
        const { action, budget } = req.body;

        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        let result;
        if (action === 'pause' || action === 'resume' || action === 'complete') {
            result = await updateCampaignStatus(id, campaignId, action);
        } else if (action === 'update_budget' && budget) {
            result = await updateCampaignBudget(id, campaignId, budget);
        } else {
            return res.status(400).json({ message: 'Invalid action. Use: pause, resume, complete, or update_budget' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Update Error:', err.message);
        next(err);
    }
};

// ── POST /projects/:id/optimize ────────────────────────────────
export const optimizeNow = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const result = await analyzeAndOptimize(id);
        res.status(200).json(result);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Optimize Error:', err.message);
        next(err);
    }
};

// ── GET /projects/:id/growth-suggestions ───────────────────────
export const getGrowthSuggestions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findOne(getAuthQuery(req, id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const suggestions = await getGrowthSuggestionsService(id);
        res.status(200).json(suggestions);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Growth Error:', err.message);
        next(err);
    }
};

// ── PUT /projects/:id/ad-config ────────────────────────────────
export const updateAdConfig = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { adConfig } = req.body;

        const project = await Project.findOneAndUpdate(
            getAuthQuery(req, id),
            { adConfig },
            { new: true }
        );

        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (err) {
        console.error('[CAMPAIGN CTRL] Config Error:', err.message);
        next(err);
    }
};
