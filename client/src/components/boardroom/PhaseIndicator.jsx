import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { DEBATE_PHASES } from '../../utils/constants';

const PhaseIndicator = ({ currentPhase }) => {
    const currentIndex = DEBATE_PHASES.findIndex((p) => p.id === currentPhase);
    // Default to 0 if not found, or 3 if complete
    const activeIndex = currentPhase === 'complete' ? 3 : Math.max(0, currentIndex);

    return (
        <div className="w-full max-w-3xl mx-auto my-8 relative">
            <div className="flex items-center justify-between">
                {DEBATE_PHASES.map((phase, idx) => {
                    const isCompleted = idx < activeIndex || currentPhase === 'complete';
                    const isActive = idx === activeIndex && currentPhase !== 'complete';
                    const isPending = idx > activeIndex && currentPhase !== 'complete';

                    return (
                        <div key={phase.id} className="relative flex flex-col items-center flex-1">
                            {/* Connector Line (except for the first item) */}
                            {idx > 0 && (
                                <div className="absolute left-[-50%] top-6 w-full h-0.5" style={{ zIndex: 0 }}>
                                    <div className="h-full bg-board-border absolute w-full" />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: isCompleted || isActive ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                        className="h-full bg-board-accent"
                                    />
                                </div>
                            )}

                            {/* Icon Container */}
                            <div
                                className={clsx(
                                    'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                                    isActive ? 'bg-board-card border-board-accent shadow-glow-accent scale-110' :
                                        isCompleted ? 'bg-board-accent border-board-accent text-white scale-100' :
                                            'bg-board-dark border-board-border text-text-muted scale-95'
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-xl">{phase.icon}</span>
                                )}

                                {/* Pulsing dot for active phase */}
                                {isActive && (
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-board-accent rounded-full border-2 border-board-dark animate-pulse" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-3 text-center transition-all duration-300">
                                <h5 className={clsx(
                                    'text-sm font-semibold tracking-wide',
                                    isActive ? 'text-white' : isCompleted ? 'text-text-primary' : 'text-text-muted'
                                )}>
                                    {phase.label}
                                </h5>
                                <p className={clsx(
                                    'text-xs mt-0.5 max-w-[120px] hidden sm:block',
                                    isActive ? 'text-text-secondary' : 'opacity-0'
                                )}>
                                    {phase.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhaseIndicator;
