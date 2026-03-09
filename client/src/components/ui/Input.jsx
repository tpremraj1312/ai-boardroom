import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
    label,
    error,
    helperText,
    className,
    containerClassName,
    as = 'input',
    icon,
    ...props
}, ref) => {
    const Component = as;

    return (
        <div className={clsx('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-board-textMain mb-1.5">
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-board-textSecondary">
                        {icon}
                    </div>
                )}
                <Component
                    ref={ref}
                    className={clsx(
                        'block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-board-bgSecondary',
                        error
                            ? 'border-board-danger focus:border-board-danger focus:ring-board-danger/20 text-board-danger'
                            : 'border-board-border focus:border-board-primary focus:ring-board-primary/20 text-board-textMain bg-white',
                        icon ? 'pl-10' : 'px-3',
                        as === 'textarea' ? 'py-3' : 'py-2 h-10',
                        className
                    )}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <p className={clsx('mt-1.5 text-xs', error ? 'text-board-danger' : 'text-board-textSecondary')}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
