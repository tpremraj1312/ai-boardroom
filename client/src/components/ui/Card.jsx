import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={clsx(
                'bg-white border border-board-border/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden relative',
                hover && 'transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
