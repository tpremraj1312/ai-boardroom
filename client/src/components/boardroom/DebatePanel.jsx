import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AgentMessage from '../agents/AgentMessage';
import AgentTypingIndicator from '../agents/AgentTypingIndicator';

const DebatePanel = ({ messages, isStreaming, activeAgent, phase }) => {
    const bottomRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming, activeAgent, phase]);

    return (
        <div
            ref={containerRef}
            className="flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 pb-32 min-h-[500px]"
        >
            <div className="flex flex-col flex-1 space-y-6">
                {messages.map((msg, index) => (
                    <React.Fragment key={msg._id || index}>
                        <AgentMessage message={msg} isStreaming={false} />

                        {/* Phase change announcements could be inserted here based on phase changes between messages, but for simplicity handled globally or skipped */}
                    </React.Fragment>
                ))}

                {isStreaming && activeAgent && (
                    <AgentTypingIndicator agentRole={activeAgent} phase={phase} />
                )}

                {messages.length === 0 && !isStreaming && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-48 text-center text-text-muted"
                    >
                        <div className="text-4xl mb-3">⚖️</div>
                        <p>The boardroom is assembling. Session will commence shortly...</p>
                    </motion.div>
                )}

                <div ref={bottomRef} className="h-1 shrink-0" />
            </div>
        </div>
    );
};

export default DebatePanel;
