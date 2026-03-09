import { generateAgentResponse } from './aiService.js';

const getDefaultDashboardData = (industry) => {
  return {
    businessModel: {
      valueProp: "A pending AI-generated value proposition for the business.",
      revenueStreams: [{ name: "Primary Product", percentage: 100 }],
      costCategories: [{ name: "Operations", percentage: 100 }],
      keyMetrics: [{ label: "Gross Margin", value: "TBD" }]
    },
    financial: {
      monthlyProjections: Array.from({ length: 12 }).map((_, i) => ({ month: `Month ${i + 1}`, revenue: 0, costs: 0, profit: 0 })),
      breakEvenMonth: 6,
      totalFundingNeeded: 0,
      fundingPhases: [{ phase: "Seed", amount: 0, purpose: "Launch" }],
      keyFinancials: [{ label: "Runway", value: "TBD", trend: "neutral" }]
    },
    market: {
      tam: 0,
      sam: 0,
      som: 0,
      tamLabel: "Global Market",
      demandTrend: [{ year: "2024", value: 0 }],
      topCompetitors: [{ name: "Competitor A", strength: 80, weakness: "None" }]
    },
    competitive: {
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      radarData: ["Product", "Marketing", "Tech", "Service", "Price", "Innovation"].map(s => ({ subject: s, user: 50, competitor: 50 })),
      differentiators: [{ factor: "TBD", score: 0, description: "TBD" }]
    },
    growth: {
      phases: [
        { name: "Launch", duration: "1-3 mo", milestones: [], kpis: [] },
        { name: "Growth", duration: "3-6 mo", milestones: [], kpis: [] },
        { name: "Scale", duration: "6-12 mo", milestones: [], kpis: [] }
      ],
      channels: [{ name: "Direct", cac: 0, potential: "High", timeline: "Immediate" }],
      unitEconomics: { ltv: 0, cac: 0, ltvCacRatio: 0, paybackMonths: 0 }
    },
    investor: {
      readinessScore: 50,
      scoreBreakdown: [{ category: "Team", score: 50, maxScore: 100 }],
      fundingTimeline: [{ milestone: "MVP", target: "Q1", amount: "₹0" }],
      topConcerns: [{ concern: "Market Risk", severity: "High", mitigation: "TBD" }],
      pitchChecklist: [{ item: "Value Prop", status: "partial" }]
    }
  };
};

export const generateDashboardData = async ({ session, messageHistory, verdict }) => {
  const prompt = `You are generating a dashboard for this specific business: "${session.inputData.description}".
The user is a ${session.userType} in the ${session.inputData.industry} industry.

CRITICAL RULES:
1. ALL monetary values MUST use Indian Rupees with the ₹ symbol (e.g. "₹50L", "₹2Cr"). NEVER use $ or USD.
2. Do NOT hallucinate. Only generate data that is directly relevant to the business described above.
3. Use realistic Indian market benchmarks for the ${session.inputData.industry} industry.
4. Keep all text concise and directly applicable to the user's specific business.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "businessModel": {
    "valueProp": "string — 1-2 sentence value proposition",
    "revenueStreams": [{ "name": "string", "percentage": number }],
    "costCategories": [{ "name": "string", "percentage": number }],
    "keyMetrics": [{ "label": "string", "value": "string" }]
  },
  "financial": {
    "monthlyProjections": [{ "month": "string", "revenue": number, "costs": number, "profit": number }],
    "breakEvenMonth": number,
    "totalFundingNeeded": number,
    "fundingPhases": [{ "phase": "string", "amount": number, "purpose": "string" }],
    "keyFinancials": [{ "label": "string", "value": "string", "trend": "up|down|neutral" }]
  },
  "market": {
    "tam": number,
    "sam": number,
    "som": number,
    "tamLabel": "string",
    "demandTrend": [{ "year": "string", "value": number }],
    "topCompetitors": [{ "name": "string", "strength": number, "weakness": "string" }]
  },
  "competitive": {
    "swot": {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "opportunities": ["string"],
      "threats": ["string"]
    },
    "radarData": [{ "subject": "string", "user": number, "competitor": number }],
    "differentiators": [{ "factor": "string", "score": number, "description": "string" }]
  },
  "growth": {
    "phases": [
      { "name": "Launch", "duration": "string", "milestones": ["string"], "kpis": ["string"] },
      { "name": "Growth", "duration": "string", "milestones": ["string"], "kpis": ["string"] },
      { "name": "Scale", "duration": "string", "milestones": ["string"], "kpis": ["string"] }
    ],
    "channels": [{ "name": "string", "cac": number, "potential": "High|Medium|Low", "timeline": "string" }],
    "unitEconomics": { "ltv": number, "cac": number, "ltvCacRatio": number, "paybackMonths": number }
  },
  "investor": {
    "readinessScore": number,
    "scoreBreakdown": [{ "category": "string", "score": number, "maxScore": number }],
    "fundingTimeline": [{ "milestone": "string", "target": "string", "amount": "string" }],
    "topConcerns": [{ "concern": "string", "severity": "High|Medium|Low", "mitigation": "string" }],
    "pitchChecklist": [{ "item": "string", "status": "complete|incomplete|partial" }]
  }
}

Use realistic numbers based on Indian market benchmarks for ${session.inputData.industry}. All monetary values MUST be in Indian Rupees (₹). Monthly projections should cover 12 months starting from Month 1.`;

  const response = await generateAgentResponse({
    systemPrompt: 'You are an elite Indian financial data analyst. You respond ONLY with valid JSON. You EXCLUSIVELY use Indian Rupees (₹) — never USD ($). You never hallucinate — every data point must be grounded in the user\'s business context.',
    messages: [{ role: 'user', content: prompt }],
    requireJson: true
  });

  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    // Return a safe fallback structure
    return getDefaultDashboardData(session.inputData.industry);
  }
};
