import { generateAgentResponse } from './aiService.js';
import Message from '../models/Message.js';
import Session from '../models/Session.js';

// ── DEEP AGENT PERSONAS ─────────────────────────────────────────
const AGENT_PERSONAS = {
    CEO: {
        color: '#6C63FF',
        systemPrompt: (userType, inputData) => `You are the CEO of a world-class business advisory board. Visionary, decisive, and strategically brilliant.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}
- Stage: ${inputData.stage || 'Early'}
- Goals: ${inputData.goals || 'Not specified'}

YOUR ROLE:
You are the strategic visionary. Focus on long-term positioning, competitive moats, and market timing.
Identify the single highest-leverage opportunity and the existential risk nobody else sees.

COMMUNICATION RULES:
- Be extremely concise and direct. Maximum 4-5 sentences.
- No excessive bold formatting. Use clean hierarchy.
- Speak like a seasoned founder who has built 3 unicorns.
- Reference specific frameworks (Blue Ocean, Porter's, Jobs-to-be-Done) when relevant.`,
    },

    CFO: {
        color: '#10B981',
        systemPrompt: (userType, inputData) => `You are the CFO. Financially disciplined, data-obsessed, and brutally honest about unit economics.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}
- Stage: ${inputData.stage || 'Early'}

YOUR ROLE:
Analyze revenue viability, burn rate implications, and path to profitability.
Always ground your analysis in specific numbers — even estimates are better than vague statements.

COMMUNICATION RULES:
- Be extremely concise. Maximum 4-5 sentences.
- Include at least one specific financial metric or benchmark.
- No excessive bold formatting. Use clean hierarchy.
- Think like the CFO who took Zerodha from ₹0 to ₹7000Cr revenue.`,
    },

    CTO: {
        color: '#3B82F6',
        systemPrompt: (userType, inputData) => `You are the CTO. Pragmatic architect, focused on technical feasibility and engineering velocity.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}

YOUR ROLE:
Assess technical feasibility, MVP scope, and build-vs-buy decisions.
Identify the critical technical risks and propose rapid iteration strategies.

COMMUNICATION RULES:
- Be extremely concise. Maximum 4-5 sentences.
- Mention specific technologies or architecture patterns when relevant.
- No excessive bold formatting. Use clean hierarchy.
- Think like the CTO who scaled Razorpay's payment infra.`,
    },

    CMO: {
        color: '#F59E0B',
        systemPrompt: (userType, inputData) => `You are the CMO. Growth-obsessed, deeply customer-centric, and data-driven about acquisition.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}

YOUR ROLE:
Define the Ideal Customer Profile (ICP) with laser precision.
Recommend specific acquisition channels with estimated CAC and conversion benchmarks.

COMMUNICATION RULES:
- Be extremely concise. Maximum 4-5 sentences.
- Include at least one specific channel recommendation with expected metrics.
- No excessive bold formatting. Use clean hierarchy.
- Think like the CMO who grew CRED from 0 to 10M users.`,
    },

    INVESTOR: {
        color: '#EF4444',
        systemPrompt: (userType, inputData) => `You are a seasoned VC Partner at a Tier-1 fund. Skeptical, return-focused, and pattern-matching across 500+ deals.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}

YOUR ROLE:
Evaluate from a pure investment lens: Is this a venture-scale opportunity?
Identify the single biggest risk that would make you pass, and what would make you write a check.

COMMUNICATION RULES:
- Be extremely concise. Maximum 4-5 sentences.
- Be brutally honest. No sugarcoating.
- No excessive bold formatting. Use clean hierarchy.
- Think like Sequoia India's investment committee.`,
    },
};

// ── INTENT DETECTION ──────────────────────────────────────────────
const detectUserIntent = async (inputData) => {
    const prompt = `Analyze this business pitch and determine the founder's PRIMARY intent. Return ONLY one word from this list:
    VALIDATE (wants idea validation)
    FUNDRAISE (wants funding strategy)
    SCALE (wants growth/scaling advice)
    PIVOT (considering a pivot)
    LAUNCH (wants go-to-market strategy)
    OPTIMIZE (wants operational efficiency)
    
    Business: ${inputData.description}
    Goals: ${inputData.goals || 'Not specified'}`;

    try {
        const intent = await generateAgentResponse({
            systemPrompt: 'You are an intent classifier. Respond with ONLY ONE WORD.',
            messages: [{ role: 'user', content: prompt }],
        });
        return intent.trim().toUpperCase().split('\n')[0];
    } catch {
        return 'VALIDATE';
    }
};

// ── DEBATE ORCHESTRATION ──────────────────────────────────────────
export const runBoardroomDebate = async ({ session, socketEmitter }) => {
    const inputData = session.inputData || {
        description: session.problemStatement || 'No description provided',
        industry: session.industry || 'General',
        stage: session.stage || 'Early',
        businessName: session.title || 'Untitled',
        goals: ''
    };
    const userType = session.userType || 'startup';

    const AGENTS = ['CEO', 'CFO', 'CTO', 'CMO', 'INVESTOR'];
    const messageHistory = [];

    const saveAndEmit = async (agentRole, content, phase, round = 1) => {
        const message = await Message.create({ sessionId: session._id, agentRole, content, phase, round });
        if (!session.agentMessages) session.agentMessages = [];
        session.agentMessages.push(message._id);
        socketEmitter('agent:message', { agentRole, content, phase, round, messageId: message._id });
        messageHistory.push({ role: 'assistant', content: `[${agentRole}]: ${content}` });
        return message;
    };

    const streamAgent = async (agentRole, conversationMessages, phase, round) => {
        socketEmitter('agent:typing', { agentRole, phase });
        let buffer = '';
        const content = await generateAgentResponse({
            systemPrompt: AGENT_PERSONAS[agentRole].systemPrompt(userType, inputData),
            messages: conversationMessages,
            onChunk: (chunk) => {
                buffer += chunk;
                socketEmitter('agent:chunk', { agentRole, chunk });
            }
        });
        await saveAndEmit(agentRole, content, phase, round);
        return content;
    };

    try {
        console.log(`[Debate] Starting debate for session ${session._id}`);

        // ── INTENT DETECTION ──────────────────────────────────────
        socketEmitter('phase:change', { phase: 'analysis', intent: null });
        const detectedIntent = await detectUserIntent(inputData);
        socketEmitter('intent:detected', { intent: detectedIntent });
        console.log(`[Debate] Detected intent: ${detectedIntent}`);

        // ── PHASE 1: STRATEGIC ANALYSIS ──────────────────────────
        socketEmitter('phase:change', { phase: 'analysis' });
        await Session.findByIdAndUpdate(session._id, { status: 'analyzing' });

        for (const agent of AGENTS) {
            console.log(`[Debate] Phase 1 - ${agent} analyzing...`);
            const prompt = `The founder's primary intent is: ${detectedIntent}.

Provide a focused 3-point analysis of this business from your ${agent} perspective:
1. The single most critical insight relevant to their ${detectedIntent} goal
2. The hidden risk nobody is talking about
3. One unconventional recommendation

Business: ${inputData.description}
Goals: ${inputData.goals || 'General strategic guidance'}
Industry: ${inputData.industry}
Stage: ${inputData.stage}`;
            await streamAgent(agent, [{ role: 'user', content: prompt }], 'analysis', 1);
        }

        // ── PHASE 2: CROSS-EXAMINATION ───────────────────────────
        socketEmitter('phase:change', { phase: 'debate' });
        await Session.findByIdAndUpdate(session._id, { status: 'debating' });

        const allAnalyses = messageHistory.map(m => m.content).join('\n\n');

        for (const agent of AGENTS) {
            console.log(`[Debate] Phase 2 - ${agent} cross-examining...`);
            const prompt = `Here are the analyses from all board members:

${allAnalyses}

Now as the ${agent}, do THREE things in 3-4 sentences total:
1. Challenge ONE specific claim from another advisor (name them)
2. Add a critical blind spot the board missed
3. State whether you'd give this a GO or NO-GO from your domain — and why in one sentence`;
            await streamAgent(agent, [{ role: 'user', content: prompt }], 'debate', 2);
        }

        // ── PHASE 3: DEVIL'S ADVOCATE ────────────────────────────
        socketEmitter('phase:change', { phase: 'devils-advocate' });

        const fullDebate = messageHistory.map(m => m.content).join('\n\n');
        console.log(`[Debate] Phase 3 - Devil's Advocate round...`);

        // Only INVESTOR and CEO do devil's advocate
        for (const agent of ['INVESTOR', 'CEO']) {
            const prompt = `The board has been too agreeable. Your job now is to be the DEVIL'S ADVOCATE.

Full discussion so far:
${fullDebate}

In 3-4 sentences:
1. Present the strongest COUNTER-ARGUMENT to the board's consensus
2. Identify the scenario where this business FAILS completely
3. State what must be TRUE for this to succeed (the critical assumption)

Be provocative but constructive.`;
            await streamAgent(agent, [{ role: 'user', content: prompt }], 'devils-advocate', 3);
        }

        // ── PHASE 4: FINAL VERDICT ───────────────────────────────
        socketEmitter('phase:change', { phase: 'verdict' });

        const fullContext = messageHistory.map(m => m.content).join('\n\n');
        console.log(`[Debate] Phase 4 - CEO delivering final verdict...`);

        const verdictPrompt = `You've heard ALL perspectives including the Devil's Advocate challenges.
Detected founder intent: ${detectedIntent}

Full board discussion:
${fullContext}

Now deliver the FINAL EXECUTIVE VERDICT. Structure it as:

1. Board Decision: GO or CONDITIONAL GO or NO-GO (with one-sentence reasoning)
2. The #1 Priority Action for the next 30 days
3. Critical Assumption That Must Hold True
4. The Contrarian Bet: One unconventional move that could 10x the outcome
5. Success Probability Estimate: X% with reasoning in one sentence

Be decisive. Be specific. No hedging.`;

        const verdict = await streamAgent('CEO', [{ role: 'user', content: verdictPrompt }], 'verdict', 4);

        // ── DASHBOARD DATA GENERATION ────────────────────────────
        console.log(`[Debate] Generating dashboard data...`);
        const { generateDashboardData } = await import('./dashboardService.js');
        const dashboardData = await generateDashboardData({
            session: { ...session.toObject(), inputData, userType },
            messageHistory,
            verdict,
            intent: detectedIntent
        });

        await Session.findByIdAndUpdate(session._id, {
            status: 'complete',
            verdict,
            dashboardData,
            agentMessages: session.agentMessages,
            completedAt: new Date()
        });

        socketEmitter('debate:complete', { verdict, dashboardData, intent: detectedIntent });
        console.log(`[Debate] Session ${session._id} completed successfully!`);

        return { verdict, dashboardData };

    } catch (error) {
        console.error(`[Debate] FATAL ERROR in session ${session._id}:`, error);
        await Session.findByIdAndUpdate(session._id, { status: 'error' });
        socketEmitter('debate:error', { message: error.message });
        throw error;
    }
};

export const runFollowUpRound = async ({ session, question, socketEmitter }) => {
    const inputData = session.inputData || { description: session.problemStatement || '', industry: session.industry || 'General', stage: session.stage || 'Early' };
    const userType = session.userType || 'startup';

    try {
        const message = await Message.create({ sessionId: session._id, agentRole: 'USER', content: question, phase: 'debate', round: 5, isFollowUp: true });
        if (!session.agentMessages) session.agentMessages = [];
        session.agentMessages.push(message._id);

        socketEmitter('agent:message', { agentRole: 'USER', content: question, phase: 'debate', round: 5, messageId: message._id });

        // All agents respond to follow-ups for richer engagement
        for (const agent of ['CEO', 'CFO', 'CTO']) {
            socketEmitter('agent:typing', { agentRole: agent, phase: 'debate' });
            let buffer = '';
            const content = await generateAgentResponse({
                systemPrompt: AGENT_PERSONAS[agent].systemPrompt(userType, inputData),
                messages: [
                    { role: 'user', content: `The founder asks: "${question}". Provide a concise, direct, actionable answer from your ${agent} perspective. Maximum 3 sentences.` }
                ],
                onChunk: (chunk) => {
                    buffer += chunk;
                    socketEmitter('agent:chunk', { agentRole: agent, chunk });
                }
            });

            const responseMessage = await Message.create({ sessionId: session._id, agentRole: agent, content, phase: 'debate', round: 5, isFollowUp: true });
            session.agentMessages.push(responseMessage._id);
            socketEmitter('agent:message', { agentRole: agent, content, phase: 'debate', round: 5, messageId: responseMessage._id });
        }

        await Session.findByIdAndUpdate(session._id, { agentMessages: session.agentMessages, $inc: { followUpCount: 1 } });

    } catch (error) {
        console.error('[FollowUp] Error:', error);
        socketEmitter('debate:error', { message: error.message });
        throw error;
    }
};
