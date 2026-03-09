import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { AGENTS } from '../utils/constants';

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

const Landing = () => {
    const { isAuthenticated } = useAuthStore();
    if (isAuthenticated) return <Navigate to="/sessions" replace />;

    return (
        <div className="min-h-screen bg-white text-board-heading overflow-hidden selection:bg-board-primary/20 selection:text-board-primary">

            {/* ── HEADER ────────────────────────────────────────────── */}
            <header className="relative z-10 w-full pt-6 pb-2 px-6 sm:px-12 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-board-primary flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-base leading-none">AI</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-board-heading">Boardroom</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-board-textSecondary hover:text-board-heading transition-colors">Login</Link>
                    <Link to="/register"><Button variant="primary" size="sm">Get Started Free</Button></Link>
                </div>
            </header>

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section className="relative max-w-7xl mx-auto px-6 sm:px-12 pt-20 pb-24">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>

                <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-board-primary/20 mb-8 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-board-primary animate-pulse"></span>
                        <span className="text-xs font-bold tracking-wide text-board-primary uppercase">AI-Powered Strategic Advisory</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-board-heading mb-6">
                        Your Virtual<br />
                        <span className="text-board-primary">Executive Board</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-board-textSecondary leading-relaxed mb-10 max-w-2xl mx-auto">
                        Pitch your business idea to 5 elite AI executives. Watch them debate in real-time, challenge each other, and deliver a comprehensive strategic dashboard with actionable insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" variant="primary" className="w-full sm:w-auto h-14 px-10 text-base font-bold">
                                Summon the Board →
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 text-base">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────────── */}
            <section className="bg-board-bgSecondary py-24 border-t border-board-border">
                <div className="max-w-6xl mx-auto px-6 sm:px-12">
                    <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-board-heading mb-3">How It Works</h2>
                        <p className="text-board-textSecondary max-w-lg mx-auto">Three simple steps to get data-driven strategic advice from your AI advisory board.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: '📝', title: 'Pitch Your Idea', desc: 'Describe your business, upload pitch decks or reports, and set the context for the board.' },
                            { step: '02', icon: '🎙️', title: 'Watch the Debate', desc: '5 AI executives analyze, challenge, and debate your strategy in real-time with live streaming.' },
                            { step: '03', icon: '📊', title: 'Get Your Dashboard', desc: 'Receive a comprehensive analytics dashboard with financials, SWOT, market sizing, and action plans.' },
                        ].map((item, i) => (
                            <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="relative bg-white rounded-2xl p-8 border border-board-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <div className="text-[10px] font-black tracking-widest text-board-primary/40 uppercase mb-2">Step {item.step}</div>
                                <h3 className="text-xl font-bold text-board-heading mb-2">{item.title}</h3>
                                <p className="text-sm text-board-textSecondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MEET YOUR BOARD ───────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 sm:px-12">
                    <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-board-heading mb-3">Meet Your Advisory Board</h2>
                        <p className="text-board-textSecondary max-w-lg mx-auto">Five specialized AI executives, each bringing deep domain expertise to every strategic discussion.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {Object.values(AGENTS).map((agent, i) => (
                            <motion.div key={agent.role} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-board-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
                                    style={{ backgroundColor: agent.bgColor }}>
                                    {agent.emoji}
                                </div>
                                <h3 className="text-base font-black text-board-heading mb-0.5">{agent.role}</h3>
                                <p className="text-xs font-semibold mb-2" style={{ color: agent.color }}>{agent.tagline}</p>
                                <p className="text-[11px] text-board-textSecondary">{agent.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── KEY FEATURES ──────────────────────────────────────── */}
            <section className="py-24 bg-board-bgSecondary border-t border-board-border">
                <div className="max-w-6xl mx-auto px-6 sm:px-12">
                    <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-board-heading mb-3">Enterprise-Grade Features</h2>
                        <p className="text-board-textSecondary max-w-lg mx-auto">Built for serious founders, consultants, and enterprise teams who need actionable intelligence.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '🎙️', title: 'Live AI Debate', desc: 'Watch 5 specialized agents debate your strategy in real-time with streaming responses and phase-by-phase analysis.' },
                            { icon: '📄', title: 'RAG Document Upload', desc: 'Upload pitch decks, financial reports, or market research PDFs. Agents use your documents as context via retrieval-augmented generation.' },
                            { icon: '📊', title: 'Strategic Dashboard', desc: 'Auto-generated executive dashboard with financials, SWOT analysis, market sizing, competitive radar, and investor readiness score.' },
                            { icon: '👥', title: 'Team Collaboration', desc: 'Invite team members with role-based access. Share sessions, collaborate on strategy, and track progress together.' },
                            { icon: '📈', title: 'Global Analytics', desc: 'Aggregated insights across all sessions — industry distribution, readiness trends, and performance benchmarks.' },
                            { icon: '🔒', title: 'Enterprise Security', desc: 'JWT authentication, rate limiting, input sanitization, and role-based access control for secure enterprise deployment.' },
                        ].map((feature, i) => (
                            <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-6 border border-board-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
                                <div className="text-3xl mb-3">{feature.icon}</div>
                                <h3 className="text-base font-bold text-board-heading mb-2">{feature.title}</h3>
                                <p className="text-sm text-board-textSecondary leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section className="py-24 bg-white border-t border-board-border">
                <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-board-heading mb-4">Ready to Get Strategic Clarity?</h2>
                    <p className="text-board-textSecondary mb-8 max-w-lg mx-auto">Join thousands of founders and enterprise teams using AI Boardroom to make better strategic decisions.</p>
                    <Link to="/register">
                        <Button size="lg" variant="primary" className="h-14 px-12 text-base font-bold">
                            Start Free — No Credit Card
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className="bg-board-bgSecondary border-t border-board-border py-8 px-6 sm:px-12">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-board-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                        <span className="font-bold text-sm text-board-heading">Boardroom</span>
                    </div>
                    <p className="text-xs text-board-textSecondary">© 2026 AI Boardroom. Enterprise Strategic Intelligence Platform.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
