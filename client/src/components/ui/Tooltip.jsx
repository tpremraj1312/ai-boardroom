import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionClasses = () => {
        switch (position) {
            case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
            case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2';
            case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2';
            case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2';
            default: return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
        }
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 whitespace-nowrap bg-board-card border border-board-border text-xs text-text-primary px-2.5 py-1.5 rounded-md shadow-card ${getPositionClasses()}`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
