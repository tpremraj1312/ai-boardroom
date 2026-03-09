import React from 'react';
import clsx from 'clsx';

const variantStyles = {
    primary: 'bg-blue-50 text-board-primary border border-board-primary/20',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    default: 'bg-board-bgSecondary text-board-textSecondary border border-board-border',
};

const Badge = ({ children, variant = 'default', className, dot }) => {
    return (
        <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
            variantStyles[variant],
            className
        )}>
            {dot && (
                <span className={clsx(
                    'mr-1.5 h-1.5 w-1.5 rounded-full',
                    variant === 'default' ? 'bg-board-textSecondary' : 'bg-current'
                )} />
            )}
            {children}
        </span>
    );
};

export default Badge;
