import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/sessions');
        } catch (err) {
            // Error is handled by store
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    return (
        <div className="min-h-screen flex text-board-textMain bg-board-bgSecondary">
            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-white border-r border-board-border">
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-board-primary flex items-center justify-center shadow-minimal">
                            <span className="text-white font-bold text-lg leading-none">AI</span>
                        </div>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 lg:mb-12">
                        <div className="hidden lg:flex w-12 h-12 rounded-lg bg-board-primary items-center justify-center shadow-minimal mb-6">
                            <span className="text-white font-bold text-xl leading-none">AI</span>
                        </div>
                        <h1 className="text-3xl font-bold text-board-heading mb-2">Sign in</h1>
                        <p className="text-board-textSecondary">Enter your details to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError(); }}
                            placeholder="ceo@company.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); clearError(); }}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-board-danger">
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="primary" className="w-full h-11 mt-6" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-board-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-board-textSecondary">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button type="button" variant="secondary" className="w-full h-11 font-medium bg-white" onClick={handleGoogleLogin}>
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-board-textSecondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-board-primary hover:text-board-primaryHover transition-colors">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-board-bgSecondary overflow-hidden flex-col justify-center items-center p-12">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-md z-10 relative space-y-8 text-center">
                    <h2 className="text-3xl font-bold text-board-heading mb-4">Welcome back to the Boardroom.</h2>
                    <p className="text-lg text-board-textSecondary leading-relaxed">
                        Your strategic intelligence platform is ready. Log in to review past sessions and access personalized executive agents.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
