import crypto from 'crypto';

// ── Mock Mode Detection ────────────────────────────────────────
const isMockMode = () => {
    return !process.env.META_ACCESS_TOKEN || !process.env.META_AD_ACCOUNT_ID;
};

// ── Mock Data Generators ───────────────────────────────────────
const generateMockId = (prefix = 'meta') => `${prefix}_${crypto.randomUUID().slice(0, 12)}`;

const generateMockPerformance = (daysActive = 1) => {
    const baseImpressions = Math.floor(Math.random() * 2000 + 500) * daysActive;
    const clickRate = 0.02 + Math.random() * 0.06; // 2-8% CTR
    const clicks = Math.floor(baseImpressions * clickRate);
    const conversionRate = 0.01 + Math.random() * 0.04;
    const conversions = Math.floor(clicks * conversionRate);
    const spend = parseFloat((Math.random() * 30 + 5 * daysActive).toFixed(2));
    const cpc = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;
    const roas = spend > 0 ? parseFloat(((conversions * 25) / spend).toFixed(2)) : 0;

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
export const createMetaCampaign = async (project, creative, budget) => {
    if (isMockMode()) {
        console.log('[META ADS] Mock Mode — Simulating campaign creation');

        const campaignId = generateMockId('mc');
        const adSetId = generateMockId('mas');
        const adId = generateMockId('mad');

        return {
            platform: 'meta',
            campaignId,
            adSetId,
            adId,
            creativeId: creative?._id?.toString() || null,
            name: `Meta — ${project.name}`,
            budget: {
                daily: budget.daily || 10,
                total: budget.total || 100,
                currency: budget.currency || 'USD'
            },
            status: 'active',
            performance: generateMockPerformance(1),
            lastSynced: new Date(),
            createdAt: new Date()
        };
    }

    // ── Real Meta API Integration ──────────────────────────────
    // This is where the actual Facebook Marketing API calls would go.
    // Requires: facebook-nodejs-business-sdk
    // Steps: 1) Create Campaign  2) Create Ad Set  3) Upload Creative  4) Create Ad
    throw new Error('Real Meta API integration requires META_ACCESS_TOKEN and META_AD_ACCOUNT_ID in .env');
};

// ── GET CAMPAIGN STATS ─────────────────────────────────────────
export const getMetaCampaignStats = async (campaign) => {
    if (isMockMode()) {
        const created = new Date(campaign.createdAt);
        const daysActive = Math.max(1, Math.ceil((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
        return generateMockPerformance(daysActive);
    }

    throw new Error('Real Meta stats fetching requires API configuration');
};

// ── UPDATE BUDGET ──────────────────────────────────────────────
export const updateMetaBudget = async (campaign, newBudget) => {
    if (isMockMode()) {
        console.log(`[META ADS] Mock — Budget updated to $${newBudget.daily}/day for campaign ${campaign.campaignId}`);
        return { success: true, newBudget };
    }

    throw new Error('Real Meta budget update requires API configuration');
};

// ── PAUSE CAMPAIGN ─────────────────────────────────────────────
export const pauseMetaCampaign = async (campaign) => {
    if (isMockMode()) {
        console.log(`[META ADS] Mock — Campaign ${campaign.campaignId} paused`);
        return { success: true, status: 'paused' };
    }

    throw new Error('Real Meta pause requires API configuration');
};

// ── RESUME CAMPAIGN ────────────────────────────────────────────
export const resumeMetaCampaign = async (campaign) => {
    if (isMockMode()) {
        console.log(`[META ADS] Mock — Campaign ${campaign.campaignId} resumed`);
        return { success: true, status: 'active' };
    }

    throw new Error('Real Meta resume requires API configuration');
};

export { isMockMode as isMetaMockMode };
