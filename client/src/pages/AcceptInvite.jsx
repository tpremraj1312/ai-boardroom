import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending'); // pending, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleInvite = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.post(`/teams/invite/accept/${token}`);
                setStatus('success');
                setMessage(data.message || 'Successfully joined the team!');
                await checkAuth(); // refresh user data to get teamId
                setTimeout(() => {
                    navigate('/team');
                }, 2000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to accept invite');
            } finally {
                setLoading(false);
            }
        };

        handleInvite();
    }, [isAuthenticated, token, navigate, checkAuth]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-12 bg-board-bg">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex bg-board-bg justify-center py-20 px-6 h-screen">
            <Card className="max-w-md w-full p-8 text-center bg-white shadow-minimal border-none">
                <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-board-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                
                <h2 className="text-2xl font-medium text-board-heading mb-3">Workspace Invitation</h2>
                
                {!isAuthenticated ? (
                    <div className="space-y-6">
                        <p className="text-board-textSecondary">
                            You've been invited to join a workspace! Please log in or create an account to accept the invitation.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <Link to={`/login?redirect=/invite/${token}`}>
                                <Button variant="primary" className="w-full font-medium">Log In to Accept</Button>
                            </Link>
                            <Link to={`/register?redirect=/invite/${token}`}>
                                <Button variant="secondary" className="w-full font-medium">Create Account</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        {status === 'success' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                                    <p className="text-board-success font-medium">{message}</p>
                                </div>
                                <p className="text-sm text-board-textSecondary">Redirecting to your workspace...</p>
                            </div>
                        ) : status === 'error' ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                                    <p className="text-board-danger font-medium">{message}</p>
                                </div>
                                <Button variant="secondary" onClick={() => navigate('/')} className="w-full font-medium">
                                    Return Home
                                </Button>
                            </div>
                        ) : null}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AcceptInvite;
