import { generateAgentResponse } from './aiService.js';
import Message from '../models/Message.js';
import Session from '../models/Session.js';

// ── AGENT PERSONA DEFINITIONS ─────────────────────────────────────
const AGENT_PERSONAS = {
    CEO: {
        color: '#6C63FF',
        systemPrompt: (userType, inputData) => `You are the CEO of a world-class business advisory board. Visionary and decisive.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}
- Industry: ${inputData.industry || 'General'}

YOUR ROLE:
Focus on market opportunity and long-term strategy. Provide direct, high-level insights. 
STRICT RULE: Be extremely concise. Use plain language. No lengthy explanations. No excessive bold text.`,
    },

    CFO: {
        color: '#10B981',
        systemPrompt: (userType, inputData) => `You are the CFO. Financially disciplined and data-driven.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}

YOUR ROLE:
Analyze revenue viability and cost structures. Provide specific financial insights.
STRICT RULE: Be extremely concise. Be direct. No lengthy preambles. No excessive bold text.`,
    },

    CTO: {
        color: '#3B82F6',
        systemPrompt: (userType, inputData) => `You are the CTO. Pragmatic and focused on technical excellence.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}

YOUR ROLE:
Assess technical feasibility and MVP scope.
STRICT RULE: Be extremely concise. Be direct. No technical jargon unless necessary. No excessive bold text.`,
    },

    CMO: {
        color: '#F59E0B',
        systemPrompt: (userType, inputData) => `You are the CMO. Growth-focused master of market strategy.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}

YOUR ROLE:
Define ICP and recommend acquisition channels.
STRICT RULE: Be extremely concise. Be direct. No marketing fluff. No excessive bold text.`,
    },

    INVESTOR: {
        color: '#FFB830',
        systemPrompt: (userType, inputData) => `You are a VC Partner. Skeptical and return-focused.

USER CONTEXT:
- Business: ${inputData.description || 'Not specified'}

YOUR ROLE:
Evaluate investment attractiveness and biggest risks.
STRICT RULE: Be extremely concise. Be brutally honest. No excessive bold text.`,
    },
};

// ── DEBATE ORCHESTRATION ──────────────────────────────────────────
export const runBoardroomDebate = async ({ session, socketEmitter }) => {
    // Null-safe extraction with fallbacks
    const inputData = session.inputData || {
        description: session.problemStatement || 'No description provided',
        industry: session.industry || 'General',
        stage: session.stage || 'Early',
        businessName: session.title || 'Untitled'
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

        // ── PHASE 1: ANALYSIS ─────────────────────────────────────────
        socketEmitter('phase:change', { phase: 'analysis' });
        await Session.findByIdAndUpdate(session._id, { status: 'analyzing' });

        for (const agent of AGENTS) {
            console.log(`[Debate] Phase 1 - ${agent} analyzing...`);
            const prompt = `Provide a concise 2-bullet point analysis of this business from your ${agent} perspective. 
Focus on the single most critical opportunity and the single most critical risk. 
Business: ${inputData.description}`;
            await streamAgent(agent, [{ role: 'user', content: prompt }], 'analysis', 1);
        }

        // ── PHASE 2: CROSS-EXAMINATION ────────────────────────────────
        socketEmitter('phase:change', { phase: 'debate' });
        await Session.findByIdAndUpdate(session._id, { status: 'debating' });

        const allAnalyses = messageHistory.map(m => m.content).join('\n\n');
        const debateContext = [
            { role: 'user', content: `Here are the initial analyses from all board members:\n\n${allAnalyses}\n\nNow engage with what OTHER board members have said. Challenge at least one other perspective, raise a concern the others missed, or add a critical insight. Be specific about which advisor you are responding to.` }
        ];

        for (const agent of AGENTS) {
            console.log(`[Debate] Phase 2 - ${agent} debating...`);
            const prompt = `Respond to the previous analyses with one direct, challenging question or a critical insight that was missed. Keep it to 1-2 sentences.`;
            await streamAgent(agent, [...debateContext, { role: 'user', content: prompt }], 'debate', 2);
        }

        // ── PHASE 3: VERDICT ──────────────────────────────────────────
        socketEmitter('phase:change', { phase: 'verdict' });

        const verdictContext = [
            { role: 'user', content: `Based on all the analysis and debate, synthesize everything into a FINAL VERDICT:\n1. Key consensus points\n2. Main conflicts between advisors and resolution\n3. Prioritized 5-step action plan\n4. Success milestones for 30 days, 90 days, and 1 year\n5. Single biggest risk and mitigation strategy\n\nMake it decisive, actionable, and inspiring.` }
        ];

        console.log(`[Debate] Phase 3 - CEO delivering verdict...`);
        const finalVerdictPrompt = `Based on the discussion, provide a final executive summary. 
1. Final resolution to the problem.
2. The core strategic direction.
Keep it extremely concise and direct.`;
        const verdict = await streamAgent('CEO', [...verdictContext, { role: 'user', content: finalVerdictPrompt }], 'verdict', 3);

        // ── DASHBOARD DATA GENERATION ─────────────────────────────────
        console.log(`[Debate] Generating dashboard data...`);
        const { generateDashboardData } = await import('./dashboardService.js');
        const dashboardData = await generateDashboardData({ session: { ...session.toObject(), inputData, userType }, messageHistory, verdict });

        await Session.findByIdAndUpdate(session._id, {
            status: 'complete',
            verdict,
            dashboardData,
            agentMessages: session.agentMessages,
            completedAt: new Date()
        });

        socketEmitter('debate:complete', { verdict, dashboardData });
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
        const message = await Message.create({ sessionId: session._id, agentRole: 'USER', content: question, phase: 'debate', round: 3, isFollowUp: true });
        if (!session.agentMessages) session.agentMessages = [];
        session.agentMessages.push(message._id);

        socketEmitter('agent:message', { agentRole: 'USER', content: question, phase: 'debate', round: 3, messageId: message._id });

        socketEmitter('agent:typing', { agentRole: 'CEO', phase: 'debate' });
        let buffer = '';
        const content = await generateAgentResponse({
            systemPrompt: AGENT_PERSONAS.CEO.systemPrompt(userType, inputData),
            messages: [
                { role: 'user', content: `The user asks: "${question}". Based on our previous analysis, please provide a concise, direct answer.` }
            ],
            onChunk: (chunk) => {
                buffer += chunk;
                socketEmitter('agent:chunk', { agentRole: 'CEO', chunk });
            }
        });

        const responseMessage = await Message.create({ sessionId: session._id, agentRole: 'CEO', content, phase: 'debate', round: 3, isFollowUp: true });
        session.agentMessages.push(responseMessage._id);

        await Session.findByIdAndUpdate(session._id, { agentMessages: session.agentMessages, $inc: { followUpCount: 1 } });

        socketEmitter('agent:message', { agentRole: 'CEO', content, phase: 'debate', round: 3, messageId: responseMessage._id });

    } catch (error) {
        console.error('[FollowUp] Error:', error);
        socketEmitter('debate:error', { message: error.message });
        throw error;
    }
};
