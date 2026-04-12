import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ── Code Block with Copy Button ─────────────────────── */
const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const lang = className?.replace('language-', '') || '';
    const code = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2 rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                <span className="text-[10px] text-gray-400 font-mono uppercase">{lang || 'code'}</span>
                <button
                    onClick={handleCopy}
                    className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                    {copied ? (
                        <><svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
                    ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                </button>
            </div>
            <pre className="p-3 overflow-x-auto text-[12px] font-mono bg-gray-50 text-gray-800 leading-5">
                <code>{code}</code>
            </pre>
        </div>
    );
};

/* ── Markdown renderer config ────────────────────────── */
const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
        if (inline) {
            return <code className="bg-gray-100 text-board-primary px-1.5 py-0.5 rounded text-[12px] font-mono" {...props}>{children}</code>;
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    p: ({ children }) => <p className="mb-2 last:mb-0 text-[13px] leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="text-[13px]">{children}</li>,
    h1: ({ children }) => <h1 className="text-base font-medium mb-2 mt-3">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-medium mb-1.5 mt-2.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-[13px] font-medium mb-1 mt-2">{children}</h3>,
    strong: ({ children }) => <strong className="font-medium text-board-heading">{children}</strong>,
    a: ({ href, children }) => <a href={href} className="text-board-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
    blockquote: ({ children }) => <blockquote className="border-l-2 border-board-primary/30 pl-3 my-2 text-gray-600 italic text-[13px]">{children}</blockquote>,
};

/* ── Message Bubble Component ────────────────────────── */
const MessageBubble = ({ message, index }) => {
    const isUser = message.role === 'user';
    const timeStr = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
        >
            {/* Role Label */}
            <div className={`flex items-center gap-1.5 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 ${
                    isUser
                        ? 'bg-board-primary/10 text-board-primary'
                        : 'bg-green-50 text-green-600'
                }`}>
                    {isUser ? 'U' : 'AI'}
                </div>
                <span className="text-[10px] text-gray-400 font-normal">
                    {isUser ? 'You' : 'Assistant'}
                </span>
                {timeStr && <span className="text-[9px] text-gray-300">{timeStr}</span>}
            </div>

            {/* Message Content */}
            <div className={`max-w-full rounded-xl px-3.5 py-2.5 ${
                isUser
                    ? 'bg-board-primary text-white rounded-br-sm'
                    : 'bg-gray-50 border border-gray-200 text-board-textMain rounded-bl-sm'
            }`}>
                {isUser ? (
                    <p className="text-[13px] font-normal leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ── Main Chat Panel Component ───────────────────────── */
const ChatPanel = ({
    messages = [],
    onSendMessage,
    isGenerating,
    generationPhase,
    activeFile,
    projectName,
}) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = useCallback(() => {
        if (!input.trim() || isGenerating) return;
        onSendMessage(input.trim());
        setInput('');
    }, [input, isGenerating, onSendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInsertFileRef = () => {
        if (activeFile) {
            setInput(prev => `${prev}@${activeFile.split('/').pop()} `);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="h-11 border-b border-board-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-board-primary to-indigo-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-[13px] font-medium text-board-heading leading-none">
                            AI Assistant
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-normal">{projectName || 'Project Chat'}</p>
                    </div>
                </div>

                {/* Phase indicator */}
                {isGenerating && (
                    <span className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        {generationPhase === 'codegen' ? 'Generating...' : generationPhase === 'blueprint' ? 'Planning...' : 'Processing...'}
                    </span>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-board-primary/10 to-indigo-50 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Ready to build</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[220px] font-normal">
                            Describe what you want to build and the AI will generate the full-stack application.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} index={i} />
                        ))}
                    </AnimatePresence>
                )}

                {/* Typing Indicator */}
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 py-2"
                    >
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-[9px] font-medium text-green-600">AI</div>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-board-border p-3 shrink-0 bg-board-bgSecondary">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isGenerating ? 'Waiting for response...' : 'Ask to add features, fix bugs, or modify code...'}
                            disabled={isGenerating}
                            className="w-full resize-none text-[13px] bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 outline-none focus:border-board-primary focus:ring-1 focus:ring-board-primary/20 transition-all disabled:opacity-50 font-normal placeholder:text-gray-400"
                            style={{ maxHeight: '120px' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                            }}
                        />
                        {/* File reference button */}
                        {activeFile && (
                            <button
                                onClick={handleInsertFileRef}
                                className="absolute right-2 bottom-2.5 text-gray-400 hover:text-board-primary transition-colors"
                                title={`Reference: ${activeFile.split('/').pop()}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim()}
                        className="h-10 w-10 rounded-xl bg-board-primary hover:bg-board-primaryHover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 shadow-sm"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[10px] text-gray-400 font-normal">
                        <kbd className="bg-gray-100 border border-gray-200 px-1 py-px rounded font-mono text-[9px]">Enter</kbd> send
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                        <kbd className="bg-gray-100 border border-gray-200 px-1 py-px rounded font-mono text-[9px]">Shift+Enter</kbd> new line
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
