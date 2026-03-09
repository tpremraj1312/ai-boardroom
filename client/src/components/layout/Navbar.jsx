import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-board-dark/80 border-b border-board-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow-accent group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold text-lg leading-none">AI</span>
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-white">
                                Boardroom
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/sessions" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-board-border mx-2"></div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end hidden sm:flex">
                                        <span className="text-sm font-medium text-white">{user?.name}</span>
                                        <span className="text-xs text-text-muted capitalize">{user?.plan} Plan</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-board-card-2 border border-board-border flex items-center justify-center text-board-accent font-bold">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
