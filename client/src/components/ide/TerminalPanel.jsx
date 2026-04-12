import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOG_COLORS = {
    info: 'text-gray-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    success: 'text-emerald-400',
    system: 'text-blue-400',
};

const LOG_PREFIXES = {
    info: '[INFO]',
    warn: '[WARN]',
    error: '[ERROR]',
    success: '[OK]',
    system: '[SYS]',
};

const TerminalPanel = ({ logs = [], isGenerating, generationPhase }) => {
    const scrollRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filter, setFilter] = useState('all'); // all | error | warn | info

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    // Detect manual scroll to pause auto-scroll
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
        setAutoScroll(isAtBottom);
    };

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(l => l.type === filter);

    const handleCopy = () => {
        const text = filteredLogs.map(l => `${LOG_PREFIXES[l.type] || ''} ${l.message}`).join('\n');
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-gray-300 font-mono text-[12px] overflow-hidden rounded-t-lg">
            {/* Terminal Header */}
            <div className="h-8 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px] text-gray-400 font-normal">Output</span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-0.5">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'error', label: 'Errors' },
                            { key: 'warn', label: 'Warnings' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                    filter === f.key
                                        ? 'bg-[#3C3C3C] text-gray-200'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Generation Indicator */}
                    {isGenerating && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 mr-2">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            {generationPhase || 'Running...'}
                        </span>
                    )}

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-[#3C3C3C] transition-colors"
                        title="Copy output"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Auto-scroll indicator */}
                    {!autoScroll && (
                        <button
                            onClick={() => setAutoScroll(true)}
                            className="p-1 rounded text-amber-500 hover:bg-[#3C3C3C] transition-colors"
                            title="Resume auto-scroll"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-2 space-y-px"
            >
                {filteredLogs.length === 0 ? (
                    <div className="text-gray-600 text-[11px] py-4 text-center">
                        {logs.length === 0
                            ? '— Terminal output will appear here during generation —'
                            : '— No matching logs —'
                        }
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filteredLogs.map((log, i) => (
                            <motion.div
                                key={`${i}-${log.message?.substring(0, 20)}`}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.1 }}
                                className="flex items-start gap-2 py-0.5 leading-relaxed"
                            >
                                <span className={`shrink-0 text-[10px] font-medium ${LOG_COLORS[log.type] || 'text-gray-500'}`}>
                                    {LOG_PREFIXES[log.type] || '[LOG]'}
                                </span>
                                <span className={`${LOG_COLORS[log.type] || 'text-gray-400'} break-all`}>
                                    {log.message}
                                </span>
                                {log.timestamp && (
                                    <span className="shrink-0 text-[9px] text-gray-600 ml-auto">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Blinking cursor at the end */}
                {isGenerating && (
                    <div className="flex items-center gap-1 py-0.5">
                        <span className="text-gray-500">{'>'}</span>
                        <span className="w-2 h-4 bg-gray-500 animate-pulse"></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminalPanel;
