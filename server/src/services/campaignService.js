import Project from '../models/Project.js';
import { createMetaCampaign, getMetaCampaignStats, updateMetaBudget, pauseMetaCampaign, resumeMetaCampaign } from './metaAdsService.js';
import { createGoogleCampaign, getGoogleCampaignStats, updateGoogleBudget, pauseGoogleCampaign, resumeGoogleCampaign } from './googleAdsService.js';

// ── PUBLISH AD ─────────────────────────────────────────────────
// Orchestrates the full one-click publish flow:
// 1. Fetch project with creatives & landing page
// 2. Calculate budget split
// 3. Launch on both platforms
// 4. Save campaigns to DB
export const publishAd = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Pick the best available creative (most recent image)
    const creative = project.creatives?.length > 0
        ? project.creatives[project.creatives.length - 1]
        : null;

    // Compute budget split from adConfig
    const config = project.adConfig || { totalBudget: 100, budgetSplit: { meta: 60, google: 40 } };
    const totalBudget = config.totalBudget || 100;
    const metaPercent = config.budgetSplit?.meta ?? 60;
    const googlePercent = config.budgetSplit?.google ?? 40;

    const metaBudget = {
        daily: parseFloat(((totalBudget * (metaPercent / 100)) / 30).toFixed(2)),
        total: parseFloat((totalBudget * (metaPercent / 100)).toFixed(2)),
        currency: 'USD'
    };

    const googleBudget = {
        daily: parseFloat(((totalBudget * (googlePercent / 100)) / 30).toFixed(2)),
        total: parseFloat((totalBudget * (googlePercent / 100)).toFixed(2)),
        currency: 'USD'
    };

    const campaigns = [];
    const errors = [];

    // Launch Meta campaign
    try {
        const metaCampaign = await createMetaCampaign(project, creative, metaBudget);
        campaigns.push(metaCampaign);
    } catch (err) {
        console.error('[CAMPAIGN SERVICE] Meta launch failed:', err.message);
        errors.push({ platform: 'meta', error: err.message });
    }

    // Launch Google campaign
    try {
        const googleCampaign = await createGoogleCampaign(project, creative, googleBudget);
        campaigns.push(googleCampaign);
    } catch (err) {
        console.error('[CAMPAIGN SERVICE] Google launch failed:', err.message);
        errors.push({ platform: 'google', error: err.message });
    }

    if (campaigns.length === 0) {
        throw new Error('Failed to launch on any platform');
    }

    // Save campaigns to project
    project.campaigns.push(...campaigns);
    project.markModified('campaigns');
    await project.save();

    return {
        project,
        launched: campaigns.length,
        errors: errors.length > 0 ? errors : null
    };
};

// ── SYNC CAMPAIGN STATS ────────────────────────────────────────
// Pulls latest performance data from each platform and updates DB
export const syncCampaignStats = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const activeCampaigns = project.campaigns.filter(c => c.status === 'active');

    for (const campaign of activeCampaigns) {
        try {
            let stats;
            if (campaign.platform === 'meta') {
                stats = await getMetaCampaignStats(campaign);
            } else if (campaign.platform === 'google') {
                stats = await getGoogleCampaignStats(campaign);
            }

            if (stats) {
                campaign.performance = stats;
                campaign.lastSynced = new Date();
            }
        } catch (err) {
            console.error(`[CAMPAIGN SERVICE] Stats sync failed for ${campaign.campaignId}:`, err.message);
        }
    }

    project.markModified('campaigns');
    await project.save();

    // Aggregate stats
    const totals = {
        impressions: 0, clicks: 0, conversions: 0, spend: 0
    };

    const byPlatform = { meta: { campaigns: [], totals: { impressions: 0, clicks: 0, conversions: 0, spend: 0 } }, google: { campaigns: [], totals: { impressions: 0, clicks: 0, conversions: 0, spend: 0 } } };

    for (const c of project.campaigns) {
        totals.impressions += c.performance?.impressions || 0;
        totals.clicks += c.performance?.clicks || 0;
        totals.conversions += c.performance?.conversions || 0;
        totals.spend += c.performance?.spend || 0;

        if (byPlatform[c.platform]) {
            byPlatform[c.platform].campaigns.push(c);
            byPlatform[c.platform].totals.impressions += c.performance?.impressions || 0;
            byPlatform[c.platform].totals.clicks += c.performance?.clicks || 0;
            byPlatform[c.platform].totals.conversions += c.performance?.conversions || 0;
            byPlatform[c.platform].totals.spend += c.performance?.spend || 0;
        }
    }

    totals.ctr = totals.impressions > 0 ? parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(2)) : 0;
    totals.cpc = totals.clicks > 0 ? parseFloat((totals.spend / totals.clicks).toFixed(2)) : 0;

    return {
        project,
        totals,
        byPlatform,
        campaignCount: project.campaigns.length,
        activeCampaigns: activeCampaigns.length,
        lastSynced: new Date()
    };
};

// ── UPDATE CAMPAIGN STATUS ─────────────────────────────────────
export const updateCampaignStatus = async (projectId, campaignId, action) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const campaign = project.campaigns.find(c => c.campaignId === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    try {
        if (action === 'pause') {
            if (campaign.platform === 'meta') await pauseMetaCampaign(campaign);
            else if (campaign.platform === 'google') await pauseGoogleCampaign(campaign);
            campaign.status = 'paused';
        } else if (action === 'resume') {
            if (campaign.platform === 'meta') await resumeMetaCampaign(campaign);
            else if (campaign.platform === 'google') await resumeGoogleCampaign(campaign);
            campaign.status = 'active';
        } else if (action === 'complete') {
            campaign.status = 'completed';
        }

        project.markModified('campaigns');
        await project.save();
        return project;
    } catch (err) {
        throw new Error(`Failed to ${action} campaign: ${err.message}`);
    }
};

// ── UPDATE CAMPAIGN BUDGET ─────────────────────────────────────
export const updateCampaignBudget = async (projectId, campaignId, newBudget) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const campaign = project.campaigns.find(c => c.campaignId === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    try {
        if (campaign.platform === 'meta') await updateMetaBudget(campaign, newBudget);
        else if (campaign.platform === 'google') await updateGoogleBudget(campaign, newBudget);

        campaign.budget = { ...campaign.budget, ...newBudget };
        project.markModified('campaigns');
        await project.save();
        return project;
    } catch (err) {
        throw new Error(`Budget update failed: ${err.message}`);
    }
};
