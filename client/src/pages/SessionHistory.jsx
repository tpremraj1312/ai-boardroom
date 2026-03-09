import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Sidebar from '../components/layout/Sidebar';

const SessionHistory = () => {
    const { sessions, fetchSessions, isLoading } = useSessionStore();

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-10" />

            <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 bg-board-bgSecondary">
                <div className="max-w-6xl mx-auto">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-board-heading mb-1 tracking-tight">Your Boardroom Sessions</h1>
                            <p className="text-sm text-board-textSecondary">Review past debates or start a new strategic analysis.</p>
                        </div>
                        <Link to="/start">
                            <Button variant="primary" size="md" icon={<span className="text-lg">+</span>}>
                                New Session
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-12 text-center bg-white border border-board-border border-dashed rounded-2xl h-80"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-board-bgSecondary flex items-center justify-center text-3xl mb-4 border border-board-border">
                                🏛️
                            </div>
                            <h3 className="text-xl font-bold text-board-heading mb-2">The Board is Waiting</h3>
                            <p className="text-sm text-board-textSecondary max-w-md mb-8">
                                You haven't convened the board yet. Start a new session to pitch your idea and receive comprehensive strategic feedback.
                            </p>
                            <Link to="/start">
                                <Button variant="primary" size="lg">Convene the Board</Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {sessions.map((session, i) => (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Card hover className="h-full flex flex-col p-5 group cursor-pointer relative overflow-hidden">
                                        <Link to={session.dashboardData ? `/dashboard/${session._id}` : `/boardroom/${session._id}`} className="absolute inset-0 z-10" />

                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant={session.status === 'complete' ? 'success' : session.status === 'error' ? 'danger' : session.status === 'analyzing' || session.status === 'debating' ? 'warning' : 'default'} dot>
                                                {session.status?.replace('_', ' ') || 'init'}
                                            </Badge>
                                            <span className="text-[10px] text-board-textSecondary font-medium">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-board-heading mb-2 line-clamp-1 group-hover:text-board-primary transition-colors">
                                            {session.inputData?.businessName || session.title || 'Untitled Project'}
                                        </h3>

                                        <p className="text-xs text-board-textSecondary line-clamp-3 mb-6 flex-1 leading-relaxed">
                                            {session.inputData?.description || session.problemStatement || 'No description available.'}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-board-border pt-3 mt-auto">
                                            <div className="flex -space-x-1.5">
                                                {['CEO', 'CFO', 'CTO'].map((role, idx) => (
                                                    <div key={role} className="w-6 h-6 rounded-full bg-board-bgSecondary border-2 border-white flex items-center justify-center text-[8px] font-bold text-board-textSecondary" style={{ zIndex: 10 - idx }}>
                                                        {role[0]}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-semibold text-board-heading group-hover:text-board-primary transition-colors flex items-center">
                                                View {session.dashboardData ? 'Dashboard' : 'Session'}
                                                <svg className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SessionHistory;
