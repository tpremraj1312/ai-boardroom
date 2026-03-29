import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardroomStore } from '../store/boardroomStore';
import { initSocket, disconnectSocket, getSocket } from '../services/socket';
import api from '../services/api';
import { AGENTS, DEBATE_PHASES, INTENT_LABELS } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import AgentAvatar from '../components/agents/AgentAvatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PHASE_ORDER = ['analysis', 'debate', 'devils-advocate', 'verdict', 'complete'];

const PHASE_META = {
    analysis: { label: '🔍 Strategic Analysis', description: 'Each advisor independently evaluates your business' },
    debate: { label: '⚔️ Cross-Examination', description: 'Advisors challenge and stress-test each other\'s positions' },
    'devils-advocate': { label: '😈 Devil\'s Advocate', description: 'Attacking the consensus to uncover blind spots' },
    verdict: { label: '⚖️ Final Verdict', description: 'CEO delivers the definitive strategic decision' },
};

/* ── Clean Markdown (no excessive bold) ── */
const MarkdownContent = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({ children }) => <h3 className="text-[13px] font-semibold mt-3 mb-1.5 text-board-heading">{children}</h3>,
            h2: ({ children }) => <h4 className="text-[13px] font-semibold mt-2.5 mb-1 text-board-heading">{children}</h4>,
            h3: ({ children }) => <h5 className="text-xs font-semibold mt-2 mb-1 text-board-heading">{children}</h5>,
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-board-textMain font-normal">{children}</p>,
            strong: ({ children }) => <span className="font-semibold text-board-heading">{children}</span>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="text-xs leading-relaxed text-board-textMain font-normal">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-board-primary/20 pl-3 italic my-2 text-board-textSecondary text-xs">{children}</blockquote>,
            code: ({ children }) => <code className="bg-board-bgSecondary px-1 py-0.5 rounded text-[10px] font-mono text-board-primary">{children}</code>,
        }}
    >
        {content}
    </ReactMarkdown>
);

/* ── Executive Decision Dashboard ── */
const DecisionDashboard = ({ data, intent }) => {
    if (!data?.topFiveDecisions) return null;
    const intentInfo = INTENT_LABELS[intent] || INTENT_LABELS.VALIDATE;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-2xl bg-white border border-board-border shadow-[0_16px_48px_rgba(0,0,0,0.08)] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-80 h-80 bg-board-primary/[0.03] rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/[0.03] rounded-full -ml-30 -mb-30 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-board-border/50 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-board-primary/10 flex items-center justify-center text-xl">🏆</div>
                        <div>
                            <h2 className="text-lg font-semibold text-board-heading tracking-tight">Executive Decision Roadmap</h2>
                            <p className="text-[11px] text-board-textSecondary font-normal">5 prioritized actions based on your board's analysis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-board-border bg-board-bgSecondary">
                        <span className="text-sm">{intentInfo.icon}</span>
                        <span className="text-[10px] font-semibold text-board-textSecondary uppercase tracking-wide">{intentInfo.label}</span>
                    </div>
                </div>
            </div>

            {/* Decisions */}
            <div className="p-8 space-y-3 relative">
                {data.topFiveDecisions.map((decision, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-board-bgSecondary/60 border border-board-border/30 hover:border-board-primary/20 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 group"
                    >
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-white border border-board-border flex items-center justify-center text-xs font-semibold text-board-primary group-hover:bg-board-primary group-hover:text-white group-hover:border-board-primary transition-all duration-200">
                            {idx + 1}
                        </span>
                        <p className="text-[13px] text-board-textMain font-normal leading-relaxed pt-1">{decision}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

/* ── Main Boardroom ── */
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
    const [detectedIntent, setDetectedIntent] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        setPhaseChanged(true);
        const timer = setTimeout(() => setPhaseChanged(false), 2000);
        return () => clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming, activeAgent]);

    useEffect(() => {
        if (justCompleted) {
            const timer = setTimeout(() => navigate(`/dashboard/${id}`), 5000);
            return () => clearTimeout(timer);
        }
    }, [justCompleted, navigate, id]);

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
                socket.on('intent:detected', ({ intent }) => setDetectedIntent(intent));
                socket.on('debate:complete', ({ verdict, dashboardData, intent }) => {
                    setVerdict(verdict);
                    setDashboardData(dashboardData);
                    if (intent) setDetectedIntent(intent);
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

    const streamBuffer = useBoardroomStore.getState().streamBuffer;
    const groupedByPhase = useMemo(() => {
        const groups = {};
        const allMsgs = [...messages];

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
    const intentInfo = INTENT_LABELS[detectedIntent] || null;

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-board-bgSecondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-2 border-board-primary/20 border-t-board-primary animate-spin" />
                        <span className="absolute inset-0 flex items-center justify-center text-xl">⚡</span>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-board-heading">Assembling your Advisory Board</p>
                        <p className="text-xs text-board-textSecondary mt-1">Analyzing your business context...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-board-bgSecondary">

            {/* Agent Sidebar */}
            <div className="hidden lg:flex flex-col w-60 bg-white border-r border-board-border shrink-0">
                <div className="p-4 border-b border-board-border">
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-board-textSecondary mb-1">Advisory Board</h3>
                    {intentInfo && (
                        <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-board-bgSecondary border border-board-border">
                            <span className="text-xs">{intentInfo.icon}</span>
                            <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: intentInfo.color }}>{intentInfo.label}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
                    {Object.values(AGENTS).map((agent) => {
                        const isActive = activeAgent === agent.role;
                        const hasSpoken = messages.some(m => m.agentRole === agent.role);
                        return (
                            <div
                                key={agent.role}
                                className={clsx(
                                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200',
                                    isActive ? 'bg-board-primary/5 border border-board-primary/15' : 'hover:bg-board-bgSecondary'
                                )}
                            >
                                <AgentAvatar role={agent.role} size="sm" isActive={isActive} />
                                <div className="flex-1 min-w-0">
                                    <p className={clsx('text-xs font-semibold truncate', isActive ? 'text-board-primary' : 'text-board-heading')}>
                                        {agent.role}
                                    </p>
                                    <p className="text-[9px] text-board-textSecondary truncate font-normal">{agent.tagline}</p>
                                </div>
                                {isActive && (
                                    <div className="flex gap-0.5">
                                        {[0, 1, 2].map(i => (
                                            <motion.span key={i} className="w-1 h-1 bg-board-primary rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                                        ))}
                                    </div>
                                )}
                                {!isActive && hasSpoken && (
                                    <span className="w-1.5 h-1.5 bg-board-success rounded-full shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {sessionInfo && (
                    <div className="p-3 border-t border-board-border">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-board-textSecondary mb-1.5">Session Brief</p>
                        <p className="text-[11px] text-board-textMain leading-snug line-clamp-4 font-normal">
                            {sessionInfo.problemStatement || sessionInfo.inputData?.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="shrink-0 bg-white border-b border-board-border px-6 py-3 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-base font-semibold text-board-heading tracking-tight">{sessionInfo?.title || sessionInfo?.inputData?.businessName || 'Strategic Session'}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={clsx("w-1.5 h-1.5 rounded-full", phase === 'complete' ? 'bg-board-success' : 'bg-board-primary animate-pulse')} />
                                <span className="text-[10px] font-medium text-board-textSecondary tracking-wide">
                                    {phase === 'complete' ? 'Debate Complete — Redirecting to Dashboard...' : `Live Session • ${PHASE_META[phase]?.label?.split(' ').slice(1).join(' ') || phase}`}
                                </span>
                            </div>
                        </div>
                        {phase === 'complete' && (
                            <Button onClick={() => navigate(`/dashboard/${id}`)} variant="primary" size="sm">
                                View Dashboard →
                            </Button>
                        )}
                    </div>

                    {/* 4-Phase Progress Bar */}
                    <div className="flex items-center gap-1">
                        {DEBATE_PHASES.map((p, i) => {
                            const isCompleted = currentPhaseIdx > i || phase === 'complete';
                            const isCurrent = p.id === phase;
                            return (
                                <div key={p.id} className="flex-1 flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-xs">{p.icon}</span>
                                            <span className={clsx('text-[9px] font-semibold uppercase tracking-wider',
                                                isCurrent ? 'text-board-primary' : isCompleted ? 'text-board-success' : 'text-board-textSecondary/40'
                                            )}>
                                                {p.label}
                                            </span>
                                        </div>
                                        <div className="h-1 rounded-full bg-board-bgSecondary overflow-hidden">
                                            <motion.div
                                                className={clsx('h-full rounded-full',
                                                    isCompleted ? 'bg-board-success' : isCurrent ? 'bg-board-primary' : 'bg-transparent'
                                                )}
                                                initial={{ width: '0%' }}
                                                animate={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                    {i < DEBATE_PHASES.length - 1 && <div className="w-3" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth scrollbar-hide">
                    <div className="max-w-5xl mx-auto">

                        {/* Phase Transition Overlay */}
                        <AnimatePresence>
                            {phaseChanged && PHASE_META[phase] && (
                                <motion.div
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                >
                                    <div className="bg-white/90 backdrop-blur-lg border border-board-border px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2.5">
                                        <span className="w-2 h-2 bg-board-primary rounded-full animate-ping" />
                                        <p className="text-[11px] font-semibold text-board-primary tracking-wide">
                                            {PHASE_META[phase]?.label}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Initial Brief */}
                        {messages.length === 0 && !isStreaming && !debateError && (
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center p-6 bg-white border border-board-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-xl mx-auto">
                                    <p className="text-[13px] text-board-textMain font-normal italic leading-relaxed">
                                        "{sessionInfo?.problemStatement || sessionInfo?.inputData?.description}"
                                    </p>
                                </div>
                                <div className="mt-5 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-board-border border-t-board-primary animate-spin" />
                                    <p className="text-[11px] text-board-textSecondary font-normal">Detecting intent and briefing advisors...</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {debateError && (
                            <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl text-center">
                                <p className="text-sm font-semibold text-red-700 mb-1">Session Error</p>
                                <p className="text-xs text-red-600 font-normal">{debateError}</p>
                                <Button variant="danger" size="sm" className="mt-3" onClick={() => { setDebateError(null); getSocket()?.emit('start:debate', { sessionId: id }); }}>
                                    Retry
                                </Button>
                            </div>
                        )}

                        {/* Render all phases */}
                        {['analysis', 'debate', 'devils-advocate', 'verdict'].map((phaseKey) => {
                            const phaseMessages = groupedByPhase[phaseKey];
                            if (!phaseMessages || phaseMessages.length === 0) return null;

                            const meta = PHASE_META[phaseKey];
                            const agentMessages = phaseMessages.filter(m => m.agentRole !== 'USER' && m.agentRole !== 'SYSTEM');
                            const userMessages = phaseMessages.filter(m => m.agentRole === 'USER' || m.agentRole === 'SYSTEM');

                            return (
                                <motion.div
                                    key={phaseKey}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="mb-8"
                                >
                                    {/* Phase Header */}
                                    <div className="flex items-center gap-3 mb-5 pb-2 border-b border-board-border/30">
                                        <div className="w-9 h-9 rounded-xl bg-board-bgSecondary flex items-center justify-center text-lg">
                                            {meta.label.split(' ')[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-board-heading">{meta.label.split(' ').slice(1).join(' ')}</h3>
                                            <p className="text-[10px] text-board-textSecondary font-normal">{meta.description}</p>
                                        </div>
                                    </div>

                                    {/* Cards */}
                                    {phaseKey === 'verdict' ? (
                                        agentMessages.map((msg) => {
                                            const agent = AGENTS[msg.agentRole];
                                            return (
                                                <motion.div
                                                    key={msg._id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white border border-board-border rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                                >
                                                    <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-board-border/40">
                                                        <AgentAvatar role={msg.agentRole} size="sm" isActive={msg.isStreaming} />
                                                        <div>
                                                            <p className="text-sm font-semibold text-board-heading">{msg.agentRole}</p>
                                                            {agent && <p className="text-[10px] text-board-textSecondary font-normal">{agent.tagline}</p>}
                                                        </div>
                                                        <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest text-board-primary bg-board-primary/5 px-3 py-1 rounded-full">
                                                            Final Verdict
                                                        </span>
                                                    </div>
                                                    <div className="text-[13px] text-board-textMain leading-relaxed">
                                                        <MarkdownContent content={msg.content} />
                                                        {msg.isStreaming && (
                                                            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-board-primary/70 animate-pulse rounded-full" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className={clsx(
                                            'grid gap-3',
                                            phaseKey === 'devils-advocate' ? 'grid-cols-1 sm:grid-cols-2' :
                                            agentMessages.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
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
                                                        className="bg-white border border-board-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col"
                                                        style={{ borderTop: `2px solid ${agent?.color || '#6C63FF'}` }}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-board-border/20">
                                                            <AgentAvatar role={msg.agentRole} size="sm" isActive={msg.isStreaming} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-board-heading">{msg.agentRole}</p>
                                                                {agent && <p className="text-[9px] text-board-textSecondary font-normal truncate">{agent.tagline}</p>}
                                                            </div>
                                                            {msg.isStreaming && (
                                                                <div className="flex gap-0.5">
                                                                    {[0, 1, 2].map(i => (
                                                                        <motion.span key={i} className="w-1 h-1 bg-board-primary rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 text-xs text-board-textMain leading-relaxed overflow-y-auto max-h-[300px] pr-1 scrollbar-hide">
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

                                    {/* User follow-up messages */}
                                    {userMessages.length > 0 && (
                                        <div className="mt-4 space-y-2.5">
                                            {userMessages.map((msg) => (
                                                <div key={msg._id} className="flex justify-end">
                                                    <div className="bg-board-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[60%] text-[13px] font-normal">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Decision Dashboard */}
                        {phase === 'complete' && dashboardData && (
                            <DecisionDashboard data={dashboardData} intent={detectedIntent} />
                        )}

                        <div ref={bottomRef} className="h-4" />
                    </div>
                </div>

                {/* Input */}
                <div className="shrink-0 bg-white border-t border-board-border p-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleFollowUp} className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    value={followUpText}
                                    onChange={(e) => setFollowUpText(e.target.value)}
                                    placeholder="Ask a follow-up question to your advisory board..."
                                    disabled={isStreaming}
                                    className="w-full bg-board-bgSecondary border border-transparent focus:border-board-primary/30 focus:bg-white rounded-xl px-4 py-3 text-sm text-board-textMain placeholder:text-board-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-board-primary/10 transition-all"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isStreaming || !followUpText.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-board-primary text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-board-primary/20"
                            >
                                Send
                            </motion.button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Boardroom;
