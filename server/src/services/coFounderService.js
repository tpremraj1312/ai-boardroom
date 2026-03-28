import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAgentResponse } from './aiService.js';
import CoFounderMemory from '../models/CoFounderMemory.js';

/* ─── Gemini with Google Search grounding for Deep Research ─── */
let genAI = null;
const getGenAI = () => {
    if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI;
};

/**
 * Perform a real web-grounded research query using Gemini + Google Search
 */
const performDeepResearch = async (query, founderContext) => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
        model: process.env.AI_MODEL || 'gemini-2.5-flash',
        systemInstruction: `You are an elite strategic research analyst for a startup founder.
FOUNDER CONTEXT: ${founderContext}

RULES:
- Search the web thoroughly for the most relevant, recent data on the topic.
- Synthesize findings from multiple sources into a clear, actionable analysis.
- Structure your response with clear sections but DO NOT use excessive bold formatting.
- Use font-weight "semibold" level emphasis sparingly, not "bold".
- Cite real sources with names and URLs where possible.
- End with a "Strategic Verdict" section that gives 3 concrete action items.
- Be direct, professional, and data-driven. No fluff.`,
        tools: [{ googleSearch: {} }]
    });

    try {
        const result = await model.generateContent(query);
        const response = result.response;
        const text = response.text();

        // Extract grounding metadata if available
        let sources = [];
        const metadata = response.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
            sources = metadata.groundingChunks
                .filter(c => c.web)
                .map(c => ({ title: c.web.title || 'Source', url: c.web.uri }))
                .slice(0, 8);
        }

        return { text, sources };
    } catch (error) {
        console.error('[CoFounder] Deep Research Error:', error.message);
        // Fallback to non-grounded response
        const fallback = await generateAgentResponse({
            systemPrompt: `You are an elite strategic research analyst. Provide a comprehensive analysis on the topic. Be data-driven and cite general industry knowledge. End with 3 action items as a "Strategic Verdict".`,
            messages: [{ role: 'user', content: query }]
        });
        return { text: fallback, sources: [] };
    }
};

/**
 * Analyze deep questionnaire results to build a comprehensive founder persona
 */
export const processQuestionnaire = async (userId, answers) => {
    const prompt = `You are a world-class organizational psychologist who has assessed 10,000+ startup founders.

Analyze these detailed founder questionnaire responses and create a comprehensive "Founder DNA Profile":
${JSON.stringify(answers, null, 2)}

Return ONLY a valid JSON object with this exact structure:
{
    "riskProfile": "cautious|moderate|aggressive",
    "founderType": "visionary|operator|hacker|hustler",
    "decisionStyle": "analytical|intuitive|collaborative|directive",
    "leadershipStyle": "servant|transformational|democratic|autocratic",
    "strengths": ["string", "string", "string"],
    "weaknesses": ["string", "string"],
    "blindSpots": ["string", "string"],
    "motivation": "string (one sentence)",
    "communicationPreference": "data-heavy|narrative|visual|bullet-points",
    "stressResponse": "fight|flight|freeze|adapt",
    "idealCofounderTone": "string (describe ideal AI co-founder interaction style in 1 sentence)",
    "personaSummary": "A 3-sentence psychological profile summary."
}`;

    const analysis = await generateAgentResponse({
        systemPrompt: "You are an expert industrial psychologist. Respond ONLY with valid JSON. No markdown, no code blocks.",
        messages: [{ role: 'user', content: prompt }],
        requireJson: true
    });

    let parsedAnalysis;
    try {
        parsedAnalysis = JSON.parse(analysis.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
        parsedAnalysis = {
            riskProfile: 'moderate', founderType: 'operator', decisionStyle: 'analytical',
            leadershipStyle: 'democratic', strengths: ['adaptability'], weaknesses: ['delegation'],
            blindSpots: ['overconfidence'], motivation: 'Building something meaningful',
            communicationPreference: 'bullet-points', stressResponse: 'adapt',
            idealCofounderTone: 'Direct and data-driven', personaSummary: 'A balanced founder.'
        };
    }

    return await CoFounderMemory.findOneAndUpdate(
        { userId },
        {
            psychology: { ...parsedAnalysis, rawAnswers: answers },
            persona: {
                tone: parsedAnalysis.idealCofounderTone || 'professional',
                focusArea: parsedAnalysis.founderType,
                historicalContext: parsedAnalysis.personaSummary || ''
            }
        },
        { upsert: true, new: true }
    );
};

/**
 * Chat with the AI Co-Founder — with optional real web-grounded Deep Research
 */
export const chatWithCoFounder = async ({ userId, message, isResearch, onChunk }) => {
    const memory = await CoFounderMemory.findOne({ userId });

    // Build rich founder context
    let founderContext = "";
    if (memory?.psychology) {
        const p = memory.psychology;
        founderContext = `
Founder Type: ${p.founderType} | Risk: ${p.riskProfile} | Decision Style: ${p.decisionStyle || 'analytical'}
Leadership: ${p.leadershipStyle || 'democratic'} | Communication: ${p.communicationPreference || 'bullet-points'}
Strengths: ${p.strengths?.join(', ')} | Blind Spots: ${p.blindSpots?.join(', ')}
Stress Response: ${p.stressResponse || 'adapt'}
Motivation: ${p.motivation}`;
    }

    // ── Deep Research Path (real web search) ──
    if (isResearch) {
        try {
            const research = await performDeepResearch(message, founderContext);

            // Stream the research result chunk by chunk
            const chunks = research.text.match(/.{1,12}/gs) || [research.text];
            let fullText = '';
            for (const chunk of chunks) {
                fullText += chunk;
                if (onChunk) onChunk(chunk);
                await new Promise(r => setTimeout(r, 15));
            }

            // Append sources if available
            if (research.sources.length > 0) {
                const sourcesBlock = '\n\n---\nSources:\n' + research.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n');
                fullText += sourcesBlock;
                if (onChunk) onChunk(sourcesBlock);
            }

            // Save to memory
            await CoFounderMemory.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        chatHistory: {
                            $each: [
                                { role: 'user', content: message },
                                { role: 'assistant', content: fullText, isResearch: true }
                            ]
                        },
                        researchHistory: {
                            query: message,
                            summary: fullText.substring(0, 500),
                            sources: research.sources.map(s => s.url)
                        }
                    }
                }
            );
            return fullText;
        } catch (err) {
            console.error('[CoFounder] Research fallback:', err.message);
        }
    }

    // ── Standard Chat Path ──
    const systemPrompt = `You are an elite AI Co-Founder — the most advanced, loyal, and strategic partner a founder could have.

YOUR FOUNDER'S DNA:
${founderContext}

PERSONA DIRECTIVE: ${memory?.persona?.tone || 'Be professional and strategic.'}

RULES:
- You remember every past conversation. Use context from your founder's history.
- Be direct, concise, and strategic. No fluff, no generic advice.
- DO NOT use excessive bold/strong formatting. Use clean hierarchy with headings and spacing.
- When uncertain, say so honestly and suggest a research query.
- Anticipate what your founder needs before they ask.
- Think like a Y-Combinator partner who has your founder's back.`;

    const chatHistory = memory?.chatHistory?.slice(-20).map(m => ({
        role: m.role, content: m.content
    })) || [];

    const response = await generateAgentResponse({
        systemPrompt,
        messages: [...chatHistory, { role: 'user', content: message }],
        onChunk
    });

    await CoFounderMemory.findOneAndUpdate(
        { userId },
        {
            $push: {
                chatHistory: {
                    $each: [
                        { role: 'user', content: message },
                        { role: 'assistant', content: response, isResearch: false }
                    ]
                }
            }
        }
    );

    return response;
};
