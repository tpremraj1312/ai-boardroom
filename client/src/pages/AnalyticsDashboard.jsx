import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import api from '../services/api';

const AnalyticsDashboard = ({ isShared = false }) => {
    const { id, token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const endpoint = isShared ? `/sessions/shared/${token}` : `/dashboard/${id}`;
                const response = await api.get(endpoint);

                if (response.data.dashboardData) {
                    setData(response.data);
                } else if (response.data.session && response.data.session.dashboardData) {
                    setData(response.data.session); // Handle shared variant populated response
                } else {
                    setError('Dashboard data not yet available. Please complete a boardroom session first.');
                }
            } catch (err) {
                setError('Failed to load dashboard. The session might be private or not exist.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [id, token, isShared]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" color="gold" /></div>;
    if (error || !data?.dashboardData) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-board-bgSecondary">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-board-heading mb-2">Dashboard Unavailable</h2>
            <p className="text-board-textSecondary mb-6">{error}</p>
            {!isShared && <Link to="/sessions"><Button variant="primary">Back to Sessions</Button></Link>}
        </div>
    );

    const dashboardDb = typeof data.dashboardData === 'string' ? JSON.parse(data.dashboardData) : data.dashboardData;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-board-bgSecondary p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1440px] mx-auto w-full mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-board-border pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-board-primary/20 mb-3 shadow-minimal">
                        <span className="w-1.5 h-1.5 rounded-full bg-board-primary animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-wide text-board-primary uppercase">Executive Summary Generated</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-board-heading mb-1">
                        {data.inputData?.businessName || dashboardDb?.businessModel?.valueProp || 'Strategic Dashboard'}
                    </h1>
                    <p className="text-board-textSecondary text-sm">
                        Comprehensive analysis prepared by your AI executive boardroom.
                    </p>
                </div>

                <div className="flex gap-3">
                    {!isShared && (
                        <>
                            <Button variant="secondary" size="sm" onClick={() => window.print()}>
                                Export PDF
                            </Button>
                            <Link to={`/boardroom/${id}`}>
                                <Button variant="primary" size="sm">
                                    View Debate Log
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <DashboardGrid data={dashboardDb} />
        </div>
    );
};

export default AnalyticsDashboard;
