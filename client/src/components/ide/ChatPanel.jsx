import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ messages, isGenerating, onSendMessage }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isGenerating) return;
        onSendMessage(input.trim());
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = '44px';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const suggestions = [
        'Add user authentication',
        'Create a dashboard page',
        'Add a dark mode toggle',
        'Implement search functionality'
    ];

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-10 border-b border-gray-100 flex items-center px-3 shrink-0">
                <span className="text-xs font-normal text-board-textMain flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></span>
                    AI Assistant
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {(!messages || messages.length === 0) && (
                    <div className="py-4">
                        <p className="text-xs text-gray-400 font-normal text-center mb-3">Quick suggestions</p>
                        <div className="space-y-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                                    className="w-full text-left px-3 py-2 text-[12px] text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 font-normal"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {messages?.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[88%] px-3 py-2 text-[12.5px] leading-relaxed font-normal
                                ${msg.role === 'user'
                                    ? 'bg-board-primary text-white rounded-2xl rounded-br-md'
                                    : 'bg-gray-100 text-board-textMain rounded-2xl rounded-bl-md border border-gray-100'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-gray-100 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask AI to add features..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-10 text-[12.5px] font-normal placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-primary/30 focus:border-board-primary/30 resize-none transition-all"
                        style={{ height: '44px' }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isGenerating}
                        className="absolute bottom-2.5 right-2 p-1.5 bg-board-primary text-white rounded-lg hover:bg-board-primaryHover disabled:opacity-40 transition-all duration-150"
                    >
                        <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
