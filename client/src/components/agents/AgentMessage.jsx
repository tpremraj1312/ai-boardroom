import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const extractJsonContent = (text) => {
    // If the agent responds strictly via streaming json, it looks like:
    // { "agent": "CEO", "analysis": "...", ...}
    // We'll try to extract the main text for display during stream.
    const analysisMatch = text.match(/"analysis"\s*:\s*"([^"]*)/);
    if (analysisMatch) return analysisMatch[1].replace(/\\n/g, '\n');

    // If fully parsed JSON
    try {
        const parsed = JSON.parse(text);
        let out = parsed.analysis || '';
        if (parsed.keyRisks && parsed.keyRisks.length > 0) {
            out += '\n\n**Key Risks:**\n- ' + parsed.keyRisks.join('\n- ');
        }
        if (parsed.recommendation) {
            out += '\n\n**Recommendation:** ' + parsed.recommendation;
        }
        return out;
    } catch (e) {
        // If it's a raw string and we haven't matched "analysis", just return the text
        return text.replace(/[{}"\\]/g, '').trim() || text;
    }
};

const AgentMessage = ({ message, isStreaming = false }) => {
    const isSystemOrUser = message.agentRole === 'SYSTEM' || message.agentRole === 'USER';

    const displayContent = isSystemOrUser ? message.content : extractJsonContent(message.content);

    return (
        <div className={clsx(
            'flex w-full mb-6 max-w-4xl mx-auto',
            isSystemOrUser ? 'justify-end' : 'justify-start'
        )}>

            {!isSystemOrUser && (
                <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 rounded-lg bg-board-bgSecondary border border-board-border flex items-center justify-center font-semibold text- board-primary text-sm shadow-minimal">
                        {message.agentRole?.substring(0, 3)}
                    </div>
                </div>
            )}

            <div className={clsx(
                'flex flex-col max-w-[85%]',
                isSystemOrUser ? 'items-end' : 'items-start'
            )}>

                <div className="flex items-center mb-1.5 space-x-2">
                    <span className="text-sm font-bold tracking-tight text-board-heading">
                        {isSystemOrUser ? 'You' : message.agentRole}
                    </span>
                    <span className="text-xs font-medium text-board-textSecondary/70">
                        {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={clsx(
                        'px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
                        isSystemOrUser
                            ? 'bg-board-primary text-white ml-auto rounded-tr-sm'
                            : 'bg-white border border-board-border/70 text-board-textMain rounded-tl-sm'
                    )}
                >
                    <div className="whitespace-pre-wrap">{displayContent}</div>

                    {isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1.5 align-middle bg-board-primary/80 animate-pulse rounded-full" />
                    )}
                </motion.div>

                {!isSystemOrUser && message.phase && (
                    <div className="mt-1.5 ml-1">
                        <span className="text-[10px] uppercase font-bold text-board-primary/70 tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {message.phase} Phase
                        </span>
                    </div>
                )}

            </div>

            {isSystemOrUser && (
                <div className="flex-shrink-0 ml-4">
                    <div className="w-10 h-10 rounded-lg bg-board-primary text-white flex items-center justify-center font-semibold text-sm shadow-minimal">
                        YOU
                    </div>
                </div>
            )}

        </div>
    );
};

export default AgentMessage;
