import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardroomStore } from '../store/boardroomStore';
import { initSocket, disconnectSocket, getSocket } from '../services/socket';
import api from '../services/api';
import { AGENTS, DEBATE_PHASES } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import AgentAvatar from '../components/agents/AgentAvatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PHASE_ORDER = ['analysis', 'debate', 'verdict', 'complete'];

const PHASE_META = {
    analysis: { label: '🔍 Individual Analysis', description: 'Each agent independently analyzes your business' },
    debate: { label: '💬 Board Discussion', description: 'Agents challenge and build on each other\'s insights' },
    verdict: { label: '⚖️ Final Verdict', description: 'CEO synthesizes the strategic recommendation' },
};

/* ── Markdown renderer with professional typography (less "bold bold") ── */
const MarkdownContent = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5 text-board-heading">{children}</h3>,
            h2: ({ children }) => <h4 className="text-sm font-semibold mt-2.5 mb-1 text-board-heading">{children}</h4>,
            h3: ({ children }) => <h5 className="text-xs font-semibold mt-2 mb-1 text-board-heading">{children}</h5>,
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-board-textMain font-normal">{children}</p>,
            strong: ({ children }) => <span className="font-semibold text-board-heading">{children}</span>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-xs leading-relaxed text-board-textMain font-normal">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-board-primary/20 pl-3 italic my-2 text-board-textSecondary">{children}</blockquote>,
            code: ({ children }) => <code className="bg-board-bgSecondary px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>,
        }}
    >
        {content}
    </ReactMarkdown>
);

const DecisionDashboard = ({ data }) => {
    if (!data?.topFiveDecisions) return null;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-10 p-8 rounded-3xl bg-white border border-board-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-board-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-board-success/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
            
            <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-board-primary/10 flex items-center justify-center text-2xl">🏆</div>
                    <div>
                        <h2 className="text-xl font-semibold text-board-heading tracking-tight">Executive Decision Roadmap</h2>
                        <p className="text-xs text-board-textSecondary">Your prioritized 5-step action plan for immediate execution</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {data.topFiveDecisions.map((decision, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-4 p-4 rounded-2xl bg-board-bgSecondary/50 border border-board-border/40 hover:border-board-primary/30 hover:bg-white hover:shadow-minimal transition-all duration-300 group"
                        >
                            <span className="shrink-0 w-8 h-8 rounded-full bg-white border border-board-border flex items-center justify-center text-xs font-semibold text-board-primary group-hover:bg-board-primary group-hover:text-white transition-colors">
                                {idx + 1}
                            </span>
                            <p className="text-sm text-board-textMain font-medium leading-relaxed pt-1">
                                {decision}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const Boardroom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const {
        messages, phase, activeAgent, isStreaming, verdict, dashboardData,
        addMessage, appendChunk, setActiveAgent, setPhase, setVerdict, setDashboardData, setMessages, reset
    } = useBoardroomStore();

    const [sessionInfo, setSessionInfo] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [followUpText, setFollowUpText] = useState('');
    const [debateError, setDebateError] = useState(null);
    const [justCompleted, setJustCompleted] = useState(false);
    const [phaseChanged, setPhaseChanged] = useState(false);
    const bottomRef = useRef(null);

    // Phase transition effect
    useEffect(() => {
        setPhaseChanged(true);
        const timer = setTimeout(() => setPhaseChanged(false), 1500);
        return () => clearTimeout(timer);
    }, [phase]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming, activeAgent]);

    // Auto-redirect ONLY on live completion
    useEffect(() => {
        if (justCompleted) {
            const timer = setTimeout(() => {
                navigate(`/dashboard/${id}`);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [justCompleted, navigate, id]);

    // Initial Fetch & Socket
    useEffect(() => {
        const fetchSessionAndConnect = async () => {
            try {
                const { data } = await api.get(`/boardroom/${id}`);
                setSessionInfo(data);

                if (data.agentMessages && data.agentMessages.length > 0) {
                    setMessages(data.agentMessages);
                }

                if ((data.status === 'complete' || data.status === 'completed') && data.dashboardData) {
                    setVerdict(data.verdict || data.finalVerdict);
                    setDashboardData(data.dashboardData);
                    setPhase('complete');
                    setIsInitializing(false);
                    return;
                } else if (data.status === 'analyzing') {
                    setPhase('analysis');
                } else if (data.status === 'debating') {
                    setPhase('debate');
                }

                const socket = initSocket(token);

                socket.on('agent:typing', ({ agentRole, phase: p }) => {
                    setActiveAgent(agentRole);
                    if (p) setPhase(p);
                });
                socket.on('agent:chunk', ({ agentRole, chunk }) => appendChunk(agentRole, chunk));
                socket.on('agent:message', ({ agentRole, content, phase: p, messageId }) => {
                    addMessage({ _id: messageId, agentRole, content, phase: p, createdAt: new Date().toISOString() });
                    setActiveAgent(null);
                });
                socket.on('phase:change', ({ phase: p }) => setPhase(p));
                socket.on('debate:complete', ({ verdict, dashboardData }) => {
                    setVerdict(verdict);
                    setDashboardData(dashboardData);
                    setPhase('complete');
                    setJustCompleted(true);
                });
                socket.on('debate:error', ({ message }) => {
                    console.error('Debate Error:', message);
                    setDebateError(message);
                    setActiveAgent(null);
                });

                socket.emit('join:session', { sessionId: id });

                if (data.status === 'init' || data.status === 'error') {
                    socket.emit('start:debate', { sessionId: id });
                }

                setIsInitializing(false);

            } catch (error) {
                console.error('Failed to fetch session', error);
                navigate('/sessions');
            }
        };

        fetchSessionAndConnect();

        return () => {
            disconnectSocket();
            reset();
        };
    }, [id, token, navigate, reset, setMessages, setPhase]);

    const handleFollowUp = (e) => {
        e.preventDefault();
        if (!followUpText.trim()) return;
        const socket = getSocket();
        if (socket) {
            socket.emit('send:followup', { sessionId: id, question: followUpText });
            setFollowUpText('');
        }
    };

    // Group messages by phase for parallel display
    const streamBuffer = useBoardroomStore.getState().streamBuffer;
    const groupedByPhase = useMemo(() => {
        const groups = {};
        const allMsgs = [...messages];

        // Add streaming message
        if (isStreaming && activeAgent && streamBuffer[activeAgent]) {
            allMsgs.push({
                _id: 'streaming-' + activeAgent,
                agentRole: activeAgent,
                content: streamBuffer[activeAgent],
                phase: phase,
                isStreaming: true
            });
        }

        for (const msg of allMsgs) {
            const p = msg.phase || 'other';
            if (!groups[p]) groups[p] = [];
            groups[p].push(msg);
        }

        return groups;
    }, [messages, isStreaming, activeAgent, streamBuffer, phase]);

    const currentPhaseIdx = PHASE_ORDER.indexOf(phase);

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-board-bgSecondary">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-board-border border-t-board-primary animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-board-textSecondary">Connecting to Secure Boardroom...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-board-bgSecondary">

            {/* Agent Sidebar Panel */}
            <div className="hidden lg:flex flex-col w-64 bg-white border-r border-board-border shrink-0">
                <div className="p-4 border-b border-board-border">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-board-textSecondary mb-1">Advisory Board</h3>
                    <p className="text-[10px] text-board-textSecondary">5 AI Executive Agents</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {Object.values(AGENTS).map((agent) => {
                        const isActive = activeAgent === agent.role;
                        const hasSpoken = messages.some(m => m.agentRole === agent.role);
                        return (
                            <div
                                key={agent.role}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                    isActive ? 'bg-blue-50 border border-board-primary/20 shadow-sm' : 'hover:bg-board-bgSecondary'
                                )}
                            >
                                <AgentAvatar role={agent.role} size="sm" isActive={isActive} />
                                <div className="flex-1 min-w-0">
                                    <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-board-primary' : 'text-board-heading')}>
                                        {agent.role}
                                    </p>
                                    <p className="text-[10px] text-board-textSecondary truncate">{agent.tagline}</p>
                                </div>
                                {isActive && (
                                    <div className="flex space-x-0.5">
                                        <span className="w-1.5 h-1.5 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                )}
                                {!isActive && hasSpoken && (
                                    <span className="w-2 h-2 bg-board-success rounded-full shrink-0"></span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Session Brief in Sidebar */}
                {sessionInfo && (
                    <div className="p-3 border-t border-board-border">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-board-textSecondary mb-1">Session Brief</p>
                        <p className="text-xs text-board-textMain leading-snug line-clamp-4">
                            {sessionInfo.problemStatement || sessionInfo.inputData?.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header with Phase Progress */}
                <div className="shrink-0 bg-white border-b border-board-border px-6 py-3 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-lg font-semibold text-board-heading tracking-tight">{sessionInfo?.title || sessionInfo?.inputData?.businessName || 'Strategic Session'}</h2>
                            <div className="flex items-center space-x-2 mt-0.5">
                                <span className={clsx("w-2 h-2 rounded-full", phase === 'complete' ? 'bg-board-success' : 'bg-board-primary animate-pulse')}></span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-board-textSecondary">
                                    {phase === 'complete' ? 'Debate Complete — Redirecting to Dashboard...' : `Live Debate • ${phase}`}
                                </span>
                            </div>
                        </div>
                        {phase === 'complete' && (
                            <Button onClick={() => navigate(`/dashboard/${id}`)} variant="primary" size="sm">
                                View Dashboard →
                            </Button>
                        )}
                    </div>

                    {/* Phase Progress Bar */}
                    <div className="flex items-center gap-1">
                        {DEBATE_PHASES.map((p, i) => {
                            const isCompleted = currentPhaseIdx > i || phase === 'complete';
                            const isCurrent = p.id === phase;
                            return (
                                <div key={p.id} className="flex-1 flex items-center gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-sm">{p.icon}</span>
                                            <span className={clsx('text-[10px] font-bold uppercase tracking-wider',
                                                isCurrent ? 'text-board-primary' : isCompleted ? 'text-board-success' : 'text-board-textSecondary/50'
                                            )}>
                                                {p.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-board-bgSecondary overflow-hidden">
                                            <motion.div
                                                className={clsx('h-full rounded-full',
                                                    isCompleted ? 'bg-board-success' : isCurrent ? 'bg-board-primary' : 'bg-transparent'
                                                )}
                                                initial={{ width: '0%' }}
                                                animate={{ width: isCompleted ? '100%' : isCurrent ? '60%' : '0%' }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                    {i < DEBATE_PHASES.length - 1 && <div className="w-4"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Message Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Phase Status Overlay */}
                        <AnimatePresence>
                            {phaseChanged && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                >
                                    <div className="bg-white/80 backdrop-blur-md border border-board-border px-6 py-2 rounded-full shadow-lg flex items-center gap-3">
                                        <span className="w-2 h-2 bg-board-primary rounded-full animate-ping"></span>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-board-primary">
                                            Transitioning to {PHASE_META[phase]?.label || phase}...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Initial Brief */}
                        {messages.length === 0 && !isStreaming && !debateError && (
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center p-5 bg-white border border-board-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-xl mx-auto">
                                    <p className="text-sm text-board-textMain font-medium italic">
                                        "{sessionInfo?.problemStatement || sessionInfo?.inputData?.description}"
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-board-border border-t-board-primary animate-spin"></div>
                                    <p className="text-xs text-board-textSecondary">Agents are reviewing the brief...</p>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {debateError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                                <p className="text-sm font-bold text-red-700 mb-1">Debate Error</p>
                                <p className="text-xs text-red-600">{debateError}</p>
                                <Button variant="danger" size="sm" className="mt-3" onClick={() => { setDebateError(null); getSocket()?.emit('start:debate', { sessionId: id }); }}>
                                    Retry Debate
                                </Button>
                            </div>
                        )}

                        {/* Render phases in order with parallel agent cards */}
                        {['analysis', 'debate', 'verdict'].map((phaseKey) => {
                            const phaseMessages = groupedByPhase[phaseKey];
                            if (!phaseMessages || phaseMessages.length === 0) return null;

                            const meta = PHASE_META[phaseKey];
                            const agentMessages = phaseMessages.filter(m => m.agentRole !== 'USER' && m.agentRole !== 'SYSTEM');
                            const userMessages = phaseMessages.filter(m => m.agentRole === 'USER' || m.agentRole === 'SYSTEM');

                            return (
                                <motion.div
                                    key={phaseKey}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="mb-8"
                                >
                                    {/* Phase Header */}
                                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-board-border/30">
                                        <div className="w-10 h-10 rounded-xl bg-board-bgSecondary flex items-center justify-center text-xl">
                                            {meta.label.split(' ')[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-board-heading">{meta.label.split(' ').slice(1).join(' ')}</h3>
                                            <p className="text-[10px] text-board-textSecondary font-medium">{meta.description}</p>
                                        </div>
                                    </div>

                                    {/* Agent Cards Grid — Parallel View */}
                                    {phaseKey === 'verdict' ? (
                                        /* Verdict: single full-width card for CEO */
                                        agentMessages.map((msg) => {
                                            const agent = AGENTS[msg.agentRole];
                                            return (
                                                <motion.div
                                                    key={msg._id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white border border-board-border rounded-xl p-5 shadow-minimal"
                                                >
                                                    <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-board-border/50">
                                                        <AgentAvatar role={msg.agentRole} size="sm" isActive={msg.isStreaming} />
                                                        <div>
                                                            <p className="text-sm font-semibold text-board-heading">{msg.agentRole}</p>
                                                            {agent && <p className="text-[10px] text-board-textSecondary font-medium">{agent.tagline}</p>}
                                                        </div>
                                                        <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest text-board-primary bg-board-primary/5 px-3 py-1 rounded-full">
                                                            Executive Verdict
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-board-textMain prose-sm max-w-none">
                                                        <MarkdownContent content={msg.content} />
                                                        {msg.isStreaming && (
                                                            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-board-primary/70 animate-pulse rounded-full" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        /* Analysis & Debate: multi-column grid */
                                        <div className={clsx(
                                            'grid gap-4',
                                            agentMessages.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                                agentMessages.length <= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                                                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                        )}>
                                            {agentMessages.map((msg) => {
                                                const agent = AGENTS[msg.agentRole];
                                                return (
                                                    <motion.div
                                                        key={msg._id}
                                                        initial={{ opacity: 0, scale: 0.97 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="bg-white border border-board-border rounded-xl p-4 shadow-minimal flex flex-col"
                                                        style={{ borderTop: `3px solid ${agent?.color || '#6C63FF'}` }}
                                                    >
                                                        {/* Agent Header */}
                                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-board-border/30">
                                                            <AgentAvatar role={msg.agentRole} size="sm" isActive={msg.isStreaming} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-board-heading">{msg.agentRole}</p>
                                                                {agent && <p className="text-[9px] text-board-textSecondary font-medium truncate">{agent.tagline}</p>}
                                                            </div>
                                                            {msg.isStreaming && (
                                                                <div className="flex space-x-0.5">
                                                                    <span className="w-1 h-1 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                    <span className="w-1 h-1 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                    <span className="w-1 h-1 bg-board-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Agent Content */}
                                                        <div className="flex-1 text-xs text-board-textMain leading-relaxed overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                                                            <MarkdownContent content={msg.content} />
                                                            {msg.isStreaming && (
                                                                <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-board-primary/70 animate-pulse rounded-full" />
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* User / System messages within this phase (follow-ups) */}
                                    {userMessages.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {userMessages.map((msg) => (
                                                <div key={msg._id} className="flex justify-end">
                                                    <div className="bg-board-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[60%] text-sm">
                                                        {msg.content}
                                                    </div>
                                                    <div className="shrink-0 ml-2 mt-1">
                                                        <div className="w-7 h-7 rounded-full bg-board-primary text-white flex items-center justify-center text-[10px] font-bold">You</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        <div ref={bottomRef} className="h-4" />
                    </div>
                </div>

                {/* Input Area - Always visible for follow-ups */}
                <div className="shrink-0 bg-white border-t border-board-border p-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleFollowUp} className="flex space-x-3">
                            <Input
                                value={followUpText}
                                onChange={(e) => setFollowUpText(e.target.value)}
                                placeholder="Ask a follow-up question to your board..."
                                disabled={isStreaming}
                                containerClassName="flex-1"
                            />
                            <Button type="submit" disabled={isStreaming || !followUpText.trim()} variant="primary" className="px-6">
                                Send
                            </Button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Boardroom;
