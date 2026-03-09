import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const VerdictBanner = ({ verdict, sessionId }) => {
    const navigate = useNavigate();

    if (!verdict) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', damping: 25 }}
            className="max-w-4xl mx-auto mt-12 mb-20 relative p-[1px] rounded-3xl overflow-hidden group"
        >
            {/* Animated glowing border */}
            <div className="absolute inset-0 bg-gradient-gold opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

            {/* Content Container */}
            <div className="relative bg-board-darker rounded-3xl p-8 sm:p-12 h-full w-full">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-board-gold-2/10 border border-board-gold-2/20 text-3xl mb-2 shadow-glow-gold">
                        ⚡
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white uppercase">
                        Final Verdict
                    </h2>

                    <div className="w-24 h-1 bg-gradient-gold rounded-full my-4 mx-auto"></div>

                    <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl font-medium">
                        The board has deliberated and determined the optimal strategic path forward for your business.
                    </p>

                    <div className="mt-8 pt-6 w-full flex justify-center border-t border-board-border/50">
                        <Button
                            variant="gold"
                            size="lg"
                            onClick={() => navigate(`/dashboard/${sessionId}`)}
                            className="px-8 py-4 sm:px-12 rounded-full w-full sm:w-auto shadow-[0_0_40px_rgba(255,184,48,0.3)] hover:shadow-[0_0_60px_rgba(255,184,48,0.5)] transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="flex items-center text-board-dark font-bold text-lg tracking-wide">
                                View Full Analytics Dashboard
                                <svg className="ml-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VerdictBanner;
