import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { AGENTS } from '../../utils/constants';

const AgentAvatar = ({ role, size = 'md', isActive = false, className }) => {
    const agent = AGENTS[role] || { color: '#6C63FF', bgColor: '#6C63FF15', initial: 'A', emoji: '🤖' };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-2xl',
    };

    return (
        <div className={clsx('relative inline-flex items-center justify-center rounded-full shrink-0', sizeClasses[size], className)}
            style={{ backgroundColor: agent.bgColor, color: agent.color }}>
            {/* Outer border/ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: isActive ? agent.color : 'transparent' }}
                animate={isActive ? {
                    boxShadow: [`0 0 0 2px ${agent.color}40`, `0 0 20px 4px ${agent.color}80`, `0 0 0 2px ${agent.color}40`]
                } : { boxShadow: 'none' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-bold relative z-10" aria-label={agent.name}>
                {agent.emoji}
            </span>
            {isActive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3/12 h-3/12 min-w-2 min-h-2 bg-board-green rounded-full border-2 border-board-dark animate-pulse" />
            )}
        </div>
    );
};

export default AgentAvatar;
