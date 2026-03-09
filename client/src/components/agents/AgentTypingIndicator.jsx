import React from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '../../utils/constants';

const dotVariants = {
    hidden: { opacity: 0.3, y: 0 },
    visible: { opacity: 1, y: -4 },
};

const AgentTypingIndicator = ({ agentRole, phase }) => {
    const agent = AGENTS[agentRole] || AGENTS.CEO;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center space-x-3 bg-board-card border border-board-border px-4 py-2.5 rounded-full shadow-card w-fit shrink-0 mt-4 mx-auto sm:mx-0 sm:ml-16"
        >
            <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0"
                style={{ backgroundColor: agent.color, color: '#fff' }}
            >
                {agent.emoji}
            </div>
            <div className="text-xs font-medium text-text-secondary whitespace-nowrap">
                <strong className="text-white font-semibold mr-1">{agentRole}</strong>
                is analyzing...
            </div>
            <div className="flex space-x-1 pl-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        variants={dotVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: i * 0.15,
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: agent.color }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default AgentTypingIndicator;
