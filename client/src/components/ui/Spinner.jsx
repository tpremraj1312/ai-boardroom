import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', color = 'accent', className }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colors = {
        accent: 'border-board-accent border-t-transparent',
        gold: 'border-board-gold border-t-transparent',
        white: 'border-white border-t-transparent',
        muted: 'border-text-secondary border-t-transparent'
    };

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 1, repeat: Infinity }}
            className={clsx(
                'rounded-full border-2',
                sizes[size],
                colors[color],
                className
            )}
        />
    );
};

export default Spinner;
