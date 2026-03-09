import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import AgentAvatar from './AgentAvatar';
import { AGENTS } from '../../utils/constants';

const AgentSeat = ({ role, isActive = false, className }) => {
    const agent = AGENTS[role];

    return (
        <motion.div
            layout
            transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
            className={clsx(
                'flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300',
                isActive ? 'bg-board-card border border-board-border shadow-card scale-105 z-10' : 'opacity-60 scale-95 hover:opacity-100',
                className
            )}
            style={isActive ? { boxShadow: `0 4px 20px ${agent.color}20`, borderColor: `${agent.color}50` } : {}}
        >
            <AgentAvatar role={role} size={isActive ? "lg" : "md"} isActive={isActive} />
            <div className="mt-3 text-center">
                <h4 className={clsx(
                    "font-bold text-sm tracking-tight transition-colors",
                    isActive ? "text-white" : "text-text-secondary"
                )} style={isActive ? { color: agent.color } : {}}>
                    {role}
                </h4>
                <p className="text-[10px] text-text-muted mt-0.5 tracking-wider uppercase font-semibold">
                    {agent.tagline.split('&')[0].trim()}
                </p>
            </div>
        </motion.div>
    );
};

export default AgentSeat;
