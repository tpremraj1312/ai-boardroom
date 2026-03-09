import React from 'react';
import clsx from 'clsx';
import Navbar from './Navbar';

const PageWrapper = ({ children, hideNavbar = false, className, contentClassName }) => {
    return (
        <div className={clsx('min-h-screen flex flex-col', className)}>
            {!hideNavbar && <Navbar />}
            <main className={clsx('flex-1 relative isolate overflow-hidden w-full', contentClassName)}>
                {/* Subtle background glow effect universally available */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-board-accent/5 to-transparent pointer-events-none -mr-0.5" />

                {children}
            </main>
        </div>
    );
};

export default PageWrapper;
