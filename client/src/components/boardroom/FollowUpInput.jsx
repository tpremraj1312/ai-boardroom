import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const FollowUpInput = ({ onSubmit, disabled }) => {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim() && !disabled) {
            onSubmit(question.trim());
            setQuestion('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
        >
            <div className="bg-gradient-to-t from-board-darker via-board-darker/90 to-transparent pt-20 pb-6 pointer-events-auto">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
                    <div className="relative flex items-center bg-board-card border border-board-border rounded-full shadow-card-hover p-1.5 focus-within:ring-2 focus-within:ring-board-accent focus-within:border-transparent transition-all">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask the board a follow-up question..."
                            className="flex-1 bg-transparent border-none text-text-primary placeholder-text-muted px-5 py-3 focus:outline-none sm:text-sm"
                            disabled={disabled}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="icon"
                            disabled={!question.trim() || disabled}
                            className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center mr-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'translateX(1px)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default FollowUpInput;
