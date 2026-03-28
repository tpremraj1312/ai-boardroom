import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ── Markdown Renderer (No excessive bold) ── */
const MarkdownContent = ({ content, isUser }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({ children }) => <h3 className={clsx("text-[13px] font-semibold mt-3 mb-1.5", isUser ? 'text-white/90' : 'text-board-heading')}>{children}</h3>,
            h2: ({ children }) => <h4 className={clsx("text-[13px] font-semibold mt-2.5 mb-1", isUser ? 'text-white/90' : 'text-board-heading')}>{children}</h4>,
            h3: ({ children }) => <h5 className={clsx("text-xs font-semibold mt-2 mb-1", isUser ? 'text-white/80' : 'text-board-heading')}>{children}</h5>,
            p: ({ children }) => <p className={clsx("mb-2 last:mb-0 leading-relaxed font-normal", isUser ? 'text-white' : 'text-board-textMain')}>{children}</p>,
            strong: ({ children }) => <span className={clsx("font-semibold", isUser ? 'text-white' : 'text-board-heading')}>{children}</span>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className={clsx("leading-relaxed font-normal", isUser ? 'text-white/90' : 'text-board-textMain')}>{children}</li>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-board-primary underline underline-offset-2 hover:text-board-primaryHover">{children}</a>,
            hr: () => <hr className="my-3 border-board-border/50" />,
            code: ({ children }) => <code className="bg-board-bgSecondary text-board-primary px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>,
        }}
    >
        {content}
    </ReactMarkdown>
);

/* ── Questionnaire Questions (12 deep psychology questions) ── */
const QUESTIONS = [
    { id: 'motivation', category: 'Core Drive', icon: '🎯', label: 'What drives you to build this venture?', options: ['Creating generational wealth', 'Solving a problem that haunts me', 'Total freedom and autonomy', 'Proving the world wrong', 'Leaving a lasting legacy'] },
    { id: 'risk', category: 'Risk DNA', icon: '⚡', label: 'A competitor just raised $50M. Your move?', options: ['Pivot strategy immediately', 'Double down on our niche', 'Find a partnership angle', 'Ignore — stay focused', 'Raise more to compete head-on'] },
    { id: 'decision', category: 'Decision Style', icon: '🧠', label: 'How do you make critical decisions?', options: ['Data and spreadsheets only', 'Gut feeling first, validate later', 'Debate with my team extensively', 'Ask 5 mentors, then decide', 'Move fast, correct course later'] },
    { id: 'leadership', category: 'Leadership', icon: '👥', label: 'Your lead engineer disagrees with your product direction. You...', options: ['Listen deeply and adapt if convinced', 'Hold firm — you know the market', 'Find a middle ground', 'Let them run an experiment', 'Replace them if misaligned'] },
    { id: 'strength', category: 'Superpower', icon: '💪', label: 'Where do you create the most value?', options: ['Product vision and design', 'Sales and closing deals', 'Building and scaling teams', 'Financial strategy and ops', 'Technology and engineering'] },
    { id: 'weakness', category: 'Growth Edge', icon: '🔍', label: 'What do you avoid or procrastinate on?', options: ['Legal and compliance work', 'Difficult conversations', 'Financial forecasting', 'Marketing and content', 'Hiring and team building'] },
    { id: 'stress', category: 'Under Pressure', icon: '🌊', label: 'Your biggest client just churned. First instinct?', options: ['Call them immediately to understand why', 'Analyze the data to find patterns', 'Focus on acquiring replacements', 'Take a walk, think strategically', 'Convene an emergency team meeting'] },
    { id: 'vision', category: 'Time Horizon', icon: '🔭', label: 'Where do you see your company in 5 years?', options: ['IPO or major acquisition', 'Profitable lifestyle business', 'Category-defining market leader', 'Sold and working on next venture', 'Global impact organization'] },
    { id: 'communication', category: 'Communication', icon: '💬', label: 'How should your AI Co-Founder talk to you?', options: ['Give me raw data and numbers', 'Tell me stories and analogies', 'Short bullet points only', 'Challenge me and push back', 'Encourage and validate first'] },
    { id: 'funding', category: 'Capital Strategy', icon: '💰', label: 'Your ideal funding approach?', options: ['Bootstrap as long as possible', 'Strategic angels only', 'Venture capital all the way', 'Revenue-based financing', 'Government grants and competitions'] },
    { id: 'failure', category: 'Resilience', icon: '🛡️', label: 'Your last venture failed. What did you learn?', options: ['Never had a failure yet', 'Started too late on sales', 'Hired the wrong people', 'Ran out of runway too fast', 'Product-market fit was off'] },
    { id: 'values', category: 'Core Values', icon: '⭐', label: 'What matters most in how you build?', options: ['Speed above everything', 'Quality and craftsmanship', 'Team happiness and culture', 'Customer obsession', 'Ethical and sustainable growth'] },
];

/* ── Questionnaire Component ── */
const Questionnaire = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const q = QUESTIONS[step];
    const progress = ((step) / QUESTIONS.length) * 100;

    const next = async (option) => {
        const newAnswers = { ...answers, [q.id]: option };
        setAnswers(newAnswers);
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            await onComplete(newAnswers);
        }
    };

    if (isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-20">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-board-primary/20 border-t-board-primary animate-spin"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🧠</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-board-heading">Analyzing your founder DNA...</p>
                    <p className="text-xs text-board-textSecondary mt-1">Building your personalized AI Co-Founder profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Progress bar */}
            <div className="bg-white border-b border-board-border px-8 py-5">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{q.icon}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-board-primary">{q.category}</span>
                        </div>
                        <span className="text-[10px] font-medium text-board-textSecondary tracking-wide">{step + 1} / {QUESTIONS.length}</span>
                    </div>
                    <div className="w-full h-1 bg-board-border/50 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-board-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>

            {/* Question area */}
            <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
                <div className="max-w-2xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
                                    <span className="text-5xl block mb-4">🤝</span>
                                    <h2 className="text-xl font-semibold text-board-heading tracking-tight">Meet Your AI Co-Founder</h2>
                                    <p className="text-xs text-board-textSecondary mt-2 max-w-md mx-auto leading-relaxed">
                                        Answer {QUESTIONS.length} questions so I can understand your psychology, decision-making style, and strategic DNA. This makes me 10x more effective as your partner.
                                    </p>
                                </motion.div>
                            )}

                            <div className="bg-white rounded-2xl border border-board-border p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                                <h3 className="text-[15px] font-semibold text-board-heading mb-5 leading-snug">{q.label}</h3>
                                <div className="space-y-2.5">
                                    {q.options.map((opt, i) => (
                                        <motion.button
                                            key={opt}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            onClick={() => next(opt)}
                                            className="w-full text-left px-5 py-3.5 rounded-xl border border-board-border hover:border-board-primary/50 hover:bg-board-primary/[0.03] transition-all duration-200 group flex items-center gap-3"
                                        >
                                            <span className="w-6 h-6 rounded-lg bg-board-bgSecondary border border-board-border flex items-center justify-center text-[10px] font-semibold text-board-textSecondary group-hover:bg-board-primary/10 group-hover:text-board-primary group-hover:border-board-primary/30 transition-all">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="text-[13px] font-medium text-board-textMain group-hover:text-board-primary transition-colors">{opt}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

/* ── Founder Profile Card (sidebar in chat) ── */
const ProfileCard = ({ psychology }) => {
    if (!psychology) return null;
    const traits = [
        { label: 'Type', value: psychology.founderType, color: 'text-blue-600' },
        { label: 'Risk', value: psychology.riskProfile, color: 'text-amber-600' },
        { label: 'Decides', value: psychology.decisionStyle, color: 'text-emerald-600' },
        { label: 'Leads', value: psychology.leadershipStyle, color: 'text-purple-600' },
    ];
    return (
        <div className="bg-white rounded-xl border border-board-border p-4 space-y-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-board-textSecondary">Founder DNA</p>
            <div className="grid grid-cols-2 gap-2">
                {traits.map(t => (
                    <div key={t.label} className="bg-board-bgSecondary rounded-lg px-3 py-2">
                        <p className="text-[9px] text-board-textSecondary font-medium uppercase tracking-wide">{t.label}</p>
                        <p className={clsx("text-xs font-semibold capitalize", t.color)}>{t.value || '—'}</p>
                    </div>
                ))}
            </div>
            {psychology.strengths?.length > 0 && (
                <div>
                    <p className="text-[9px] text-board-textSecondary font-medium uppercase tracking-wide mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                        {psychology.strengths.map(s => (
                            <span key={s} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                        ))}
                    </div>
                </div>
            )}
            {psychology.blindSpots?.length > 0 && (
                <div>
                    <p className="text-[9px] text-board-textSecondary font-medium uppercase tracking-wide mb-1">Blind Spots</p>
                    <div className="flex flex-wrap gap-1">
                        {psychology.blindSpots.map(s => (
                            <span key={s} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Main Co-Founder Component ── */
const CoFounder = () => {
    const [memory, setMemory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isResearch, setIsResearch] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { fetchMemory(); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);

    const fetchMemory = async () => {
        try {
            const { data } = await api.get('/co-founder/memory');
            setMemory(data);
            if (data.chatHistory?.length > 0) {
                setMessages(data.chatHistory);
            } else if (data.psychology) {
                setMessages([{ role: 'assistant', content: `I've mapped your founder DNA. You're a **${data.psychology.founderType}** with a **${data.psychology.riskProfile}** risk appetite.\n\nI'm fully calibrated to your psychology now. What strategic challenge should we tackle first?` }]);
            }
        } catch (error) {
            console.error('Failed to fetch co-founder memory', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuestionnaireComplete = async (answers) => {
        try {
            const { data } = await api.post('/co-founder/questionnaire', { answers });
            setMemory(data);
            setMessages([{ role: 'assistant', content: `Your Founder DNA analysis is complete.\n\nYou're a **${data.psychology.founderType}** founder with **${data.psychology.riskProfile}** risk tolerance and a **${data.psychology.decisionStyle}** decision-making style.\n\nI've calibrated my entire interaction model to match your psychology. Let's build something extraordinary — what's the first challenge on your plate?` }]);
        } catch (error) {
            console.error('Questionnaire error', error);
            setMessages([{ role: 'assistant', content: "I'm ready to work with you. What's on your mind?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = useCallback(async (e) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text || isThinking) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInputText('');
        setIsThinking(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/co-founder/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message: text, isResearch })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            setMessages(prev => [...prev, { role: 'assistant', content: '', isResearch }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.chunk) {
                                assistantContent += parsed.chunk;
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = { role: 'assistant', content: assistantContent, isResearch };
                                    return next;
                                });
                            }
                        } catch {}
                    }
                }
            }
        } catch (error) {
            console.error('Chat error', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setIsThinking(false);
            inputRef.current?.focus();
        }
    }, [inputText, isResearch, isThinking]);

    /* ── Loading State ── */
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-board-bgSecondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-board-primary border-t-transparent animate-spin" />
                    <span className="text-xs text-board-textSecondary font-medium">Loading your Co-Founder...</span>
                </div>
            </div>
        );
    }

    /* ── Questionnaire State ── */
    if (!memory || memory.status === 'new' || !memory.psychology) {
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
    }

    /* ── Chat UI ── */
    return (
        <div className="flex h-full bg-board-bgSecondary">
            {/* Main Chat Column */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white border-b border-board-border px-6 py-3.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-board-primary/10 to-board-primary/5 flex items-center justify-center text-lg border border-board-primary/10">🤝</div>
                        <div>
                            <h2 className="text-sm font-semibold text-board-heading tracking-tight">AI Co-Founder</h2>
                            <p className="text-[10px] text-board-textSecondary font-medium">
                                <span className="capitalize">{memory.psychology.founderType}</span>
                                <span className="mx-1.5 text-board-border">•</span>
                                <span className="capitalize">{memory.psychology.riskProfile} risk</span>
                                <span className="mx-1.5 text-board-border">•</span>
                                <span className="capitalize">{memory.psychology.decisionStyle}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Deep Research Toggle */}
                        <button
                            onClick={() => setIsResearch(!isResearch)}
                            className={clsx(
                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all duration-200",
                                isResearch
                                    ? 'bg-board-primary/5 border-board-primary text-board-primary shadow-sm shadow-board-primary/10'
                                    : 'bg-white border-board-border text-board-textSecondary hover:border-board-textSecondary'
                            )}
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            DEEP RESEARCH {isResearch ? 'ON' : 'OFF'}
                        </button>
                        {/* Profile Toggle */}
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className={clsx(
                                "w-8 h-8 rounded-lg border flex items-center justify-center transition-all text-xs",
                                showProfile ? 'bg-board-primary/5 border-board-primary text-board-primary' : 'border-board-border text-board-textSecondary hover:text-board-textMain'
                            )}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Research mode banner */}
                <AnimatePresence>
                    {isResearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-board-primary/[0.03] border-b border-board-primary/10 overflow-hidden"
                        >
                            <div className="px-6 py-2.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-board-primary animate-pulse" />
                                <span className="text-[10px] font-medium text-board-primary tracking-wide">
                                    Deep Research Active — Your next message will trigger a web-wide analysis across research papers, articles, and market data
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-lg bg-board-primary/10 flex items-center justify-center text-sm mr-2.5 mt-1 shrink-0">🤝</div>
                                )}
                                <div className={clsx(
                                    'max-w-[80%] px-4 py-3 rounded-2xl',
                                    msg.role === 'user'
                                        ? 'bg-board-primary text-white rounded-br-md'
                                        : 'bg-white border border-board-border rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                                )}>
                                    {msg.isResearch && msg.role === 'assistant' && (
                                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-board-primary/10">
                                            <svg className="w-3 h-3 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span className="text-[9px] font-semibold text-board-primary uppercase tracking-widest">Deep Research Analysis</span>
                                        </div>
                                    )}
                                    <div className={clsx('text-[13px] leading-relaxed', msg.role === 'user' ? 'text-white' : 'text-board-textMain')}>
                                        <MarkdownContent content={msg.content} isUser={msg.role === 'user'} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Thinking indicator */}
                        {isThinking && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="w-7 h-7 rounded-lg bg-board-primary/10 flex items-center justify-center text-sm mr-2.5 mt-1 shrink-0">🤝</div>
                                <div className="bg-white border border-board-border px-4 py-3 rounded-2xl rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.span
                                                    key={i}
                                                    className="w-1.5 h-1.5 bg-board-primary/60 rounded-full"
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-board-textSecondary font-medium">
                                            {isResearch ? 'Researching across the web...' : 'Thinking...'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-board-border shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={sendMessage} className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={isResearch ? "Ask anything — I'll research the web for you..." : "Discuss strategy, get advice, brainstorm..."}
                                    className="w-full bg-board-bgSecondary border border-transparent focus:border-board-primary/30 focus:bg-white rounded-xl px-4 py-3 text-sm text-board-textMain placeholder:text-board-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-board-primary/10 transition-all"
                                    disabled={isThinking}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isThinking || !inputText.trim()}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="bg-board-primary text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-board-primary/20 hover:shadow-board-primary/30 transition-shadow"
                            >
                                {isResearch ? 'Research' : 'Send'}
                            </motion.button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Founder DNA Sidebar */}
            <AnimatePresence>
                {showProfile && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-l border-board-border bg-board-bgSecondary overflow-hidden shrink-0"
                    >
                        <div className="p-4 w-[280px] space-y-4 overflow-y-auto h-full scrollbar-hide">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-board-textSecondary">Your Founder DNA</p>
                                <button onClick={() => setShowProfile(false)} className="text-board-textSecondary hover:text-board-textMain">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <ProfileCard psychology={memory.psychology} />

                            {memory.psychology.personaSummary && (
                                <div className="bg-white rounded-xl border border-board-border p-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-board-textSecondary mb-2">AI Assessment</p>
                                    <p className="text-xs text-board-textMain leading-relaxed font-normal">{memory.psychology.personaSummary}</p>
                                </div>
                            )}

                            {memory.researchHistory?.length > 0 && (
                                <div className="bg-white rounded-xl border border-board-border p-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-board-textSecondary mb-2">Research History</p>
                                    <div className="space-y-2">
                                        {memory.researchHistory.slice(-5).reverse().map((r, i) => (
                                            <div key={i} className="text-[11px] text-board-textMain border-b border-board-border/50 pb-2 last:border-0">
                                                <p className="font-medium truncate">{r.query}</p>
                                                <p className="text-[10px] text-board-textSecondary mt-0.5">{r.sources?.length || 0} sources</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoFounder;
