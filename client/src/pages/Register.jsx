import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/sessions');
        } catch (err) {
            // Error handled
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    return (
        <div className="min-h-screen flex text-board-textMain bg-board-bgSecondary">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-white border-r border-board-border">
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2 group">
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
                        <h1 className="text-3xl font-bold text-board-heading mb-2">Create an account</h1>
                        <p className="text-board-textSecondary">Assemble your AI boardroom today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearError(); }}
                            placeholder="Jane Doe"
                            required
                        />

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
                            helperText="Must be at least 6 characters long."
                        />

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-board-danger mt-2">
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="primary" className="w-full h-11 mt-6" isLoading={isLoading}>
                            Create Account
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
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-board-primary hover:text-board-primaryHover transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 relative bg-board-bgSecondary overflow-hidden flex-col justify-center items-center p-12">
                <div className="absolute right-0 bottom-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-md z-10 relative space-y-6">
                    <blockquote className="text-2xl font-semibold text-board-heading leading-tight">
                        "The boardroom debated my startup idea for 15 minutes and uncovered critical blind spots I had missed in 6 months of planning."
                    </blockquote>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="w-10 h-10 rounded-full bg-white border border-board-border flex items-center justify-center font-bold text-board-primary shadow-sm">
                            JD
                        </div>
                        <div>
                            <p className="text-board-heading font-medium">John Doe</p>
                            <p className="text-sm text-board-textSecondary">Founder, TechSpace</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
