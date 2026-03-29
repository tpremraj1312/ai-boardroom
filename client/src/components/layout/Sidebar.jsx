import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

const Sidebar = ({ className }) => {
    const { user } = useAuthStore();

    const navItems = [
        { name: 'Sessions', path: '/sessions', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'New Boardroom', path: '/start', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
        { name: 'Team', path: '/team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Analytics', path: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'AI Co-Founder', path: '/co-founder', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
        { name: 'Website Generator', path: '/website-generator', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { name: 'Full-Stack IDE', path: '/project-genesis', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { name: 'Ad Studio', path: '/ad-studio', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    return (
        <div className={clsx('flex flex-col h-full bg-white border-r border-board-border w-64', className)}>
            <div className="p-6">
                <h2 className="text-xs font-semibold text-board-textSecondary uppercase tracking-wider mb-4">
                    Dashboard Menu
                </h2>
                <nav className="space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => clsx(
                                'flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium',
                                isActive
                                    ? 'bg-blue-50 text-board-primary'
                                    : 'text-board-textSecondary hover:bg-board-bgSecondary hover:text-board-textMain'
                            )}
                        >
                            <svg
                                className={clsx('w-5 h-5 mr-3', 'opacity-70 group-hover:opacity-100')}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-board-border bg-board-bgSecondary/50">
                <div className="bg-white rounded-lg p-4 border border-board-border shadow-minimal">
                    <p className="text-sm font-semibold text-board-heading mb-0.5">Plan: <span className="capitalize text-board-primary">{user?.plan || 'Pro'}</span></p>
                    <p className="text-xs text-board-textSecondary mb-3">{user?.sessionsCount || 0} sessions used</p>
                    <div className="w-full bg-board-border h-1.5 rounded-full overflow-hidden">
                        <div className="bg-board-primary h-full w-1/3 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
