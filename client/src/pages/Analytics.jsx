import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/sessions');
                setSessions(data);

                const industryCount = {};
                const statusCount = { init: 0, analyzing: 0, debating: 0, complete: 0, error: 0 };
                const readinessScores = [];
                const monthlyTrend = {};

                data.forEach(s => {
                    // Industry aggregation
                    const industry = s.inputData?.industry || s.industry || 'Other';
                    industryCount[industry] = (industryCount[industry] || 0) + 1;

                    // Status aggregation
                    const status = s.status || 'init';
                    statusCount[status] = (statusCount[status] || 0) + 1;

                    // Readiness scores
                    if (s.dashboardData && typeof s.dashboardData === 'string') {
                        try {
                            const parsed = JSON.parse(s.dashboardData);
                            if (parsed.investor?.readinessScore) readinessScores.push(parsed.investor.readinessScore);
                        } catch (e) { }
                    } else if (s.dashboardData?.investor?.readinessScore) {
                        readinessScores.push(s.dashboardData.investor.readinessScore);
                    }

                    // Monthly trend
                    const month = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
                });

                const industryChartData = Object.keys(industryCount).map(k => ({ name: k, sessions: industryCount[k] }));
                const statusChartData = Object.keys(statusCount).filter(k => statusCount[k] > 0).map(k => ({ name: k, value: statusCount[k] }));
                const trendData = Object.keys(monthlyTrend).map(k => ({ month: k, sessions: monthlyTrend[k] }));

                const avgScore = readinessScores.length > 0
                    ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length)
                    : 0;

                const completedCount = data.filter(s => s.status === 'complete').length;
                const completionRate = data.length > 0 ? Math.round((completedCount / data.length) * 100) : 0;

                setMetrics({
                    totalSessions: data.length,
                    completedSessions: completedCount,
                    completionRate,
                    avgReadinessScore: avgScore,
                    topIndustry: industryChartData.sort((a, b) => b.sessions - a.sessions)[0]?.name || 'N/A',
                    industryChartData,
                    statusChartData,
                    trendData
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-10" />

            <main className="flex-1 overflow-y-auto bg-board-bgSecondary p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-board-heading tracking-tight">Global Analytics</h1>
                        <p className="text-board-textSecondary mt-1 text-sm">Aggregated insights across all boardroom sessions and team performance.</p>
                    </div>

                    {/* ── STAT CARDS ──────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-board-textSecondary mb-1">Total Sessions</p>
                            <p className="text-3xl font-black text-board-primary">{metrics?.totalSessions || 0}</p>
                        </Card>
                        <Card className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-board-textSecondary mb-1">Completed</p>
                            <p className="text-3xl font-black text-board-success">{metrics?.completedSessions || 0}</p>
                        </Card>
                        <Card className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-board-textSecondary mb-1">Completion Rate</p>
                            <p className="text-3xl font-black text-board-heading">{metrics?.completionRate || 0}<span className="text-lg">%</span></p>
                        </Card>
                        <Card className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-board-textSecondary mb-1">Avg Readiness</p>
                            <p className="text-3xl font-black text-board-primary">{metrics?.avgReadinessScore || 0}<span className="text-lg text-board-textSecondary">/100</span></p>
                        </Card>
                        <Card className="p-5 bg-blue-50/50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-board-primary mb-1">Top Industry</p>
                            <p className="text-lg font-bold text-board-heading truncate">{metrics?.topIndustry}</p>
                        </Card>
                    </div>

                    {/* ── CHARTS ROW ─────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        {/* Industry Distribution */}
                        <Card className="lg:col-span-2 p-6">
                            <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Sessions by Industry</h3>
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics?.industryChartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#F8F9FA' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #E9ECEF', fontSize: '12px' }} />
                                        <Bar dataKey="sessions" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Status Distribution */}
                        <Card className="p-6">
                            <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Session Status</h3>
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={metrics?.statusChartData || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30} paddingAngle={4}>
                                            {metrics?.statusChartData?.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center mt-2">
                                {metrics?.statusChartData?.map((s, i) => (
                                    <span key={i} className="flex items-center gap-1 text-[10px] text-board-textSecondary capitalize">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                        {s.name} ({s.value})
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* ── TREND + RECENT SESSIONS ─────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Monthly Trend */}
                        <Card className="p-6">
                            <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Monthly Trend</h3>
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metrics?.trendData || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #E9ECEF', fontSize: '12px' }} />
                                        <Line type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#2563EB' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Recent Sessions Table */}
                        <Card className="lg:col-span-2 p-6">
                            <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Recent Sessions</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-board-border">
                                            <th className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider pb-2">Business</th>
                                            <th className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider pb-2">Industry</th>
                                            <th className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider pb-2">Status</th>
                                            <th className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider pb-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.slice(0, 8).map((s) => (
                                            <tr key={s._id} className="border-b border-board-border/50 last:border-0 hover:bg-board-bgSecondary transition-colors">
                                                <td className="py-2.5">
                                                    <Link to={s.dashboardData ? `/dashboard/${s._id}` : `/boardroom/${s._id}`}
                                                        className="text-xs font-semibold text-board-heading hover:text-board-primary transition-colors truncate max-w-[200px] block">
                                                        {s.inputData?.businessName || s.title || 'Untitled'}
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 text-xs text-board-textSecondary">{s.inputData?.industry || s.industry || '—'}</td>
                                                <td className="py-2.5">
                                                    <Badge variant={s.status === 'complete' ? 'success' : s.status === 'error' ? 'danger' : 'default'} dot>
                                                        {s.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 text-xs text-board-textSecondary">{new Date(s.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {sessions.length === 0 && (
                                    <p className="text-sm text-board-textSecondary text-center py-8">No sessions yet. Start your first boardroom session!</p>
                                )}
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Analytics;
