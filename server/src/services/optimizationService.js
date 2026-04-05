import Project from '../models/Project.js';
import { generateAgentResponse } from './aiService.js';
import { syncCampaignStats, updateCampaignBudget, updateCampaignStatus } from './campaignService.js';

// ── AI OPTIMIZATION PROMPT ─────────────────────────────────────
const buildOptimizationPrompt = (project, stats) => `
You are an expert digital advertising AI agent. Analyze the following campaign performance data and provide optimization recommendations.

PROJECT: ${project.name}
OBJECTIVE: ${project.adConfig?.objective || 'conversions'}
TOTAL BUDGET: $${project.adConfig?.totalBudget || 100}
CURRENT SPLIT: Meta ${project.adConfig?.budgetSplit?.meta || 60}% / Google ${project.adConfig?.budgetSplit?.google || 40}%

CAMPAIGN PERFORMANCE:
${JSON.stringify(stats.byPlatform, null, 2)}

OVERALL TOTALS:
${JSON.stringify(stats.totals, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
    "analysis": "Brief performance analysis (2-3 sentences)",
    "recommendations": [
        {
            "type": "budget_shift" | "pause_campaign" | "scale_campaign" | "new_creative",
            "platform": "meta" | "google" | null,
            "campaignId": "campaign ID if applicable" | null,
            "action": "Description of the recommended action",
            "priority": "high" | "medium" | "low",
            "expectedImpact": "Expected outcome description"
        }
    ],
    "newBudgetSplit": {
        "meta": <number 0-100>,
        "google": <number 0-100>
    },
    "overallScore": <number 1-10>,
    "topInsight": "Single most important insight"
}
`;

// ── GROWTH AGENT PROMPT ────────────────────────────────────────
const buildGrowthPrompt = (project, stats) => `
You are an AI Growth Strategist for digital advertising campaigns. Based on the performance data, generate actionable growth suggestions.

PROJECT: ${project.name}
DESCRIPTION: ${project.prompt}
DEPLOYED URL: ${project.deployedUrl || 'Not deployed'}
CREATIVES COUNT: ${project.creatives?.length || 0}
CAMPAIGNS: ${project.campaigns?.length || 0}
LANDING PAGE: ${project.deployedUrl || 'None'}

PERFORMANCE DATA:
${JSON.stringify(stats?.totals || {}, null, 2)}

BY PLATFORM:
${JSON.stringify(stats?.byPlatform || {}, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
    "suggestions": [
        {
            "id": "unique_id",
            "category": "creative" | "budget" | "audience" | "platform" | "strategy",
            "title": "Short action title",
            "description": "Detailed description of what to do and why",
            "priority": "high" | "medium" | "low",
            "estimatedImpact": "Expected improvement",
            "actionable": true
        }
    ],
    "overallStrategy": "2-3 sentence high-level strategy recommendation",
    "nextSteps": ["Step 1", "Step 2", "Step 3"]
}
`;

// ── ANALYZE AND OPTIMIZE ───────────────────────────────────────
export const analyzeAndOptimize = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // First, sync latest stats
    const stats = await syncCampaignStats(projectId);

    if (!project.campaigns || project.campaigns.length === 0) {
        return {
            project,
            analysis: 'No active campaigns to optimize. Publish ads first.',
            recommendations: [],
            applied: []
        };
    }

    // Call AI for analysis
    let optimizationResult;
    try {
        const rawResponse = await generateAgentResponse({
            systemPrompt: buildOptimizationPrompt(project, stats),
            messages: [{ role: 'user', content: 'Analyze and provide optimization recommendations.' }],
            requireJson: true
        });

        const cleaned = rawResponse.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        optimizationResult = JSON.parse(cleaned);
    } catch (err) {
        console.error('[OPTIMIZATION] AI analysis failed:', err.message);
        // Fallback: deterministic optimization
        optimizationResult = generateFallbackOptimization(project, stats);
    }

    // Auto-apply safe recommendations if autoOptimize is enabled
    const applied = [];
    if (project.adConfig?.autoOptimize) {
        for (const rec of optimizationResult.recommendations || []) {
            try {
                if (rec.type === 'pause_campaign' && rec.campaignId && rec.priority === 'high') {
                    await updateCampaignStatus(projectId, rec.campaignId, 'pause');
                    applied.push({ ...rec, status: 'applied' });
                }

                if (rec.type === 'budget_shift' && optimizationResult.newBudgetSplit) {
                    const refreshed = await Project.findById(projectId);
                    refreshed.adConfig.budgetSplit = optimizationResult.newBudgetSplit;
                    refreshed.markModified('adConfig');
                    await refreshed.save();
                    applied.push({ ...rec, status: 'applied' });
                }
            } catch (applyErr) {
                console.error('[OPTIMIZATION] Failed to apply recommendation:', applyErr.message);
                applied.push({ ...rec, status: 'failed', error: applyErr.message });
            }
        }
    }

    // Refresh project after changes
    const updatedProject = await Project.findById(projectId);

    return {
        project: updatedProject,
        analysis: optimizationResult.analysis,
        recommendations: optimizationResult.recommendations || [],
        newBudgetSplit: optimizationResult.newBudgetSplit,
        overallScore: optimizationResult.overallScore,
        topInsight: optimizationResult.topInsight,
        applied,
        stats: stats.totals
    };
};

// ── GET GROWTH SUGGESTIONS ─────────────────────────────────────
export const getGrowthSuggestions = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Sync stats first
    let stats = { totals: {}, byPlatform: {} };
    try {
        stats = await syncCampaignStats(projectId);
    } catch (err) {
        console.warn('[GROWTH AGENT] Stats sync failed, using empty data');
    }

    try {
        const rawResponse = await generateAgentResponse({
            systemPrompt: buildGrowthPrompt(project, stats),
            messages: [{ role: 'user', content: 'Generate growth suggestions for this project.' }],
            requireJson: true
        });

        const cleaned = rawResponse.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('[GROWTH AGENT] AI failed:', err.message);
        return generateFallbackGrowthSuggestions(project, stats);
    }
};

// ── FALLBACK OPTIMIZATION (when AI is unavailable) ─────────────
const generateFallbackOptimization = (project, stats) => {
    const metaStats = stats.byPlatform?.meta?.totals || {};
    const googleStats = stats.byPlatform?.google?.totals || {};

    const metaCtr = metaStats.impressions > 0 ? (metaStats.clicks / metaStats.impressions) * 100 : 0;
    const googleCtr = googleStats.impressions > 0 ? (googleStats.clicks / googleStats.impressions) * 100 : 0;

    const betterPlatform = metaCtr > googleCtr ? 'meta' : 'google';
    const recommendations = [];

    if (Math.abs(metaCtr - googleCtr) > 1) {
        recommendations.push({
            type: 'budget_shift',
            platform: betterPlatform,
            campaignId: null,
            action: `Shift 15% more budget to ${betterPlatform === 'meta' ? 'Meta' : 'Google'} — higher CTR by ${Math.abs(metaCtr - googleCtr).toFixed(1)}%`,
            priority: 'high',
            expectedImpact: 'Estimated 10-20% improvement in overall conversions'
        });
    }

    return {
        analysis: `${betterPlatform === 'meta' ? 'Meta' : 'Google'} is outperforming with ${Math.max(metaCtr, googleCtr).toFixed(2)}% CTR. Total spend: $${stats.totals?.spend?.toFixed(2) || '0'}.`,
        recommendations,
        newBudgetSplit: betterPlatform === 'meta' ? { meta: 70, google: 30 } : { meta: 40, google: 60 },
        overallScore: Math.min(10, Math.round((stats.totals?.ctr || 3) * 1.5)),
        topInsight: `${betterPlatform === 'meta' ? 'Meta' : 'Google'} campaigns show strongest engagement metrics.`
    };
};

// ── FALLBACK GROWTH SUGGESTIONS ────────────────────────────────
const generateFallbackGrowthSuggestions = (project, stats) => {
    const suggestions = [
        {
            id: 'sug_1',
            category: 'creative',
            title: 'Generate More Ad Variations',
            description: `Create 2–3 more creative variations to enable A/B testing. Current count: ${project.creatives?.length || 0} creatives.`,
            priority: 'high',
            estimatedImpact: '15-25% improvement in CTR through creative testing',
            actionable: true
        },
        {
            id: 'sug_2',
            category: 'budget',
            title: 'Increase Daily Budget Gradually',
            description: 'Increase total budget by 20% weekly for campaigns showing positive ROAS to capture more volume.',
            priority: 'medium',
            estimatedImpact: 'Scale conversions proportionally with maintained efficiency',
            actionable: true
        },
        {
            id: 'sug_3',
            category: 'platform',
            title: 'Expand to Video Ads',
            description: 'Add video creatives for YouTube and Instagram Reels to tap into video-first audiences with higher engagement.',
            priority: 'medium',
            estimatedImpact: '2-3x engagement rate compared to static images',
            actionable: true
        }
    ];

    return {
        suggestions,
        overallStrategy: 'Focus on creative diversification and gradual budget scaling. Test video formats alongside existing image ads.',
        nextSteps: [
            'Generate 2 more creative variations in Ad Studio',
            'Increase budget by 20% on the winning platform',
            'Create a video ad for YouTube/Instagram Reels'
        ]
    };
};
