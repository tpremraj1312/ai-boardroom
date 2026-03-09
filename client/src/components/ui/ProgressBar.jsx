import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ProgressBar = ({ value, max = 100, color = 'accent', className, height = 'h-2', showLabel = false }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
        accent: 'bg-board-accent',
        green: 'bg-board-green',
        amber: 'bg-board-amber',
        red: 'bg-board-red',
        gold: 'bg-board-gold',
    };

    return (
        <div className={clsx('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1 text-xs text-text-secondary font-medium">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={clsx('w-full bg-board-border rounded-full overflow-hidden', height)}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={clsx('h-full rounded-full shadow-glow-accent', colors[color])}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
