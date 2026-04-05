import crypto from 'crypto';

// ── Mock Mode Detection ────────────────────────────────────────
const isMockMode = () => {
    return !process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
};

// ── Mock Data Generators ───────────────────────────────────────
const generateMockId = (prefix = 'google') => `${prefix}_${crypto.randomUUID().slice(0, 12)}`;

const generateMockPerformance = (daysActive = 1) => {
    const baseImpressions = Math.floor(Math.random() * 1800 + 400) * daysActive;
    const clickRate = 0.015 + Math.random() * 0.05; // 1.5-6.5% CTR
    const clicks = Math.floor(baseImpressions * clickRate);
    const conversionRate = 0.008 + Math.random() * 0.035;
    const conversions = Math.floor(clicks * conversionRate);
    const spend = parseFloat((Math.random() * 25 + 4 * daysActive).toFixed(2));
    const cpc = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;
    const roas = spend > 0 ? parseFloat(((conversions * 22) / spend).toFixed(2)) : 0;

    return {
        impressions: baseImpressions,
        clicks,
        ctr: parseFloat((clickRate * 100).toFixed(2)),
        conversions,
        spend,
        cpc,
        roas
    };
};

// ── CREATE CAMPAIGN ────────────────────────────────────────────
export const createGoogleCampaign = async (project, creative, budget) => {
    if (isMockMode()) {
        console.log('[GOOGLE ADS] Mock Mode — Simulating campaign creation');

        const campaignId = generateMockId('gc');
        const adGroupId = generateMockId('gag');
        const adId = generateMockId('gad');

        return {
            platform: 'google',
            campaignId,
            adSetId: adGroupId,
            adId,
            creativeId: creative?._id?.toString() || null,
            name: `Google — ${project.name}`,
            budget: {
                daily: budget.daily || 8,
                total: budget.total || 80,
                currency: budget.currency || 'USD'
            },
            status: 'active',
            performance: generateMockPerformance(1),
            lastSynced: new Date(),
            createdAt: new Date()
        };
    }

    throw new Error('Real Google Ads integration requires GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_DEVELOPER_TOKEN in .env');
};

// ── GET CAMPAIGN STATS ─────────────────────────────────────────
export const getGoogleCampaignStats = async (campaign) => {
    if (isMockMode()) {
        const created = new Date(campaign.createdAt);
        const daysActive = Math.max(1, Math.ceil((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
        return generateMockPerformance(daysActive);
    }

    throw new Error('Real Google stats fetching requires API configuration');
};

// ── UPDATE BUDGET ──────────────────────────────────────────────
export const updateGoogleBudget = async (campaign, newBudget) => {
    if (isMockMode()) {
        console.log(`[GOOGLE ADS] Mock — Budget updated to $${newBudget.daily}/day for campaign ${campaign.campaignId}`);
        return { success: true, newBudget };
    }

    throw new Error('Real Google budget update requires API configuration');
};

// ── PAUSE CAMPAIGN ─────────────────────────────────────────────
export const pauseGoogleCampaign = async (campaign) => {
    if (isMockMode()) {
        console.log(`[GOOGLE ADS] Mock — Campaign ${campaign.campaignId} paused`);
        return { success: true, status: 'paused' };
    }

    throw new Error('Real Google pause requires API configuration');
};

// ── RESUME CAMPAIGN ────────────────────────────────────────────
export const resumeGoogleCampaign = async (campaign) => {
    if (isMockMode()) {
        console.log(`[GOOGLE ADS] Mock — Campaign ${campaign.campaignId} resumed`);
        return { success: true, status: 'active' };
    }

    throw new Error('Real Google resume requires API configuration');
};

export { isMockMode as isGoogleMockMode };
