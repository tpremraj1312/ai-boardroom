import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    type = 'button',
    icon,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-minimal';

    const variants = {
        primary: 'bg-board-primary text-white hover:bg-board-primaryHover focus:ring-board-primary',
        secondary: 'bg-white text-board-textMain border border-board-border hover:bg-board-bgSecondary focus:ring-board-border',
        ghost: 'bg-transparent text-board-textSecondary hover:bg-board-bgSecondary hover:text-board-textMain shadow-none',
        danger: 'bg-board-danger text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <motion.button
            type={type}
            disabled={isLoading || disabled}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
            whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z m 2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : icon && <span className="mr-2">{icon}</span>}
            {children}
        </motion.button>
    );
};

export default Button;
