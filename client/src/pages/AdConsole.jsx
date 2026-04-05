import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useProjectStore from '../store/projectStore';

/* ═══════════════════ ICON COMPONENTS ═══════════════════ */

const IconRocket = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.37m6 6l-3.54 3.53m3.53-3.53a14.9 14.9 0 00-3.53-9.17m0 0L6.06 14.74m6.03-6.37L6.06 14.74M3 17.25V21h3.75L12 15.75" />
    </svg>
);

const IconChart = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const IconBolt = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

const IconEye = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconCursor = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
);

const IconTarget = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconSparkle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const IconPause = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
);

const IconPlay = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const IconRefresh = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
);

const IconLightBulb = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
);

/* ═══════════════════ CONSTANTS ═══════════════════ */

const PLATFORM_COLORS = {
    meta: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: '#3b82f6', gradient: 'from-blue-500 to-indigo-600' },
    google: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: '#10b981', gradient: 'from-emerald-500 to-teal-600' }
};

const PIE_COLORS = ['#3b82f6', '#10b981'];

const STATUS_STYLES = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    paused: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    draft: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
};

/* ═══════════════════ STAT CARD ═══════════════════ */

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35 }}
        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group"
    >
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg bg-${color}-50 flex items-center justify-center border border-${color}-100/50 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4.5 h-4.5 text-${color}-500`} />
            </div>
            <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-[22px] font-semibold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-1 font-normal">{sub}</p>}
    </motion.div>
);

/* ═══════════════════ CAMPAIGN ROW ═══════════════════ */

const CampaignRow = ({ campaign, onPause, onResume }) => {
    const status = STATUS_STYLES[campaign.status] || STATUS_STYLES.draft;
    const platform = PLATFORM_COLORS[campaign.platform] || PLATFORM_COLORS.meta;

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
        >
            {/* Platform badge */}
            <div className={`px-2.5 py-1 rounded-lg ${platform.bg} ${platform.text} text-[11px] font-medium uppercase tracking-wider border ${platform.border}`}>
                {campaign.platform === 'meta' ? 'Meta' : 'Google'}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-800 font-medium truncate">{campaign.name}</p>
                <p className="text-[11px] text-gray-400 font-normal">ID: {campaign.campaignId?.slice(0, 16)}...</p>
            </div>

            {/* Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${campaign.status === 'active' ? 'animate-pulse' : ''}`} />
                <span className="text-[11px] font-medium capitalize">{campaign.status}</span>
            </div>

            {/* Metrics strip */}
            <div className="hidden lg:flex items-center gap-5">
                <div className="text-center">
                    <p className="text-[11px] text-gray-400 font-medium">CTR</p>
                    <p className="text-[13px] text-gray-800 font-semibold">{campaign.performance?.ctr?.toFixed(1) || 0}%</p>
                </div>
                <div className="text-center">
                    <p className="text-[11px] text-gray-400 font-medium">Clicks</p>
                    <p className="text-[13px] text-gray-800 font-semibold">{(campaign.performance?.clicks || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-[11px] text-gray-400 font-medium">Spend</p>
                    <p className="text-[13px] text-gray-800 font-semibold">${campaign.performance?.spend?.toFixed(2) || '0.00'}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {campaign.status === 'active' ? (
                    <button onClick={() => onPause(campaign.campaignId)}
                        className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/50 flex items-center justify-center transition-colors"
                        title="Pause">
                        <IconPause className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                ) : campaign.status === 'paused' ? (
                    <button onClick={() => onResume(campaign.campaignId)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 flex items-center justify-center transition-colors"
                        title="Resume">
                        <IconPlay className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                ) : null}
            </div>
        </motion.div>
    );
};

/* ═══════════════════ CUSTOM TOOLTIP ═══════════════════ */

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-lg p-3 min-w-[140px]">
            <p className="text-[11px] text-gray-500 font-medium mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[12px] text-gray-600 font-normal capitalize">{p.dataKey}</span>
                    </div>
                    <span className="text-[12px] text-gray-900 font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

const AdConsole = () => {
    const {
        projects, activeProject, fetchProjects, loadProject, setActiveProject,
        publishAd, isPublishing,
        fetchCampaignStats, campaignStats, isFetchingStats,
        updateCampaign,
        optimizeNow, isOptimizing, optimizationResult,
        fetchGrowthSuggestions, growthSuggestions, isFetchingSuggestions,
        updateAdConfig, error, clearError
    } = useProjectStore();

    const [activeTab, setActiveTab] = useState('overview');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [budgetMeta, setBudgetMeta] = useState(60);
    const [totalBudget, setTotalBudget] = useState(100);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    useEffect(() => {
        if (activeProject?.adConfig) {
            setBudgetMeta(activeProject.adConfig.budgetSplit?.meta ?? 60);
            setTotalBudget(activeProject.adConfig.totalBudget ?? 100);
        }
    }, [activeProject?._id]);

    // Auto-fetch stats when project changes and has campaigns
    useEffect(() => {
        if (activeProject?.campaigns?.length > 0) {
            fetchCampaignStats();
        }
    }, [activeProject?._id]);

    const campaigns = useMemo(() => {
        const all = activeProject?.campaigns || [];
        if (platformFilter === 'all') return all;
        return all.filter(c => c.platform === platformFilter);
    }, [activeProject?.campaigns, platformFilter]);

    const activeCampaignCount = campaigns.filter(c => c.status === 'active').length;
    const totalSpend = campaigns.reduce((s, c) => s + (c.performance?.spend || 0), 0);
    const totalImpressions = campaigns.reduce((s, c) => s + (c.performance?.impressions || 0), 0);
    const totalClicks = campaigns.reduce((s, c) => s + (c.performance?.clicks || 0), 0);
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const totalConversions = campaigns.reduce((s, c) => s + (c.performance?.conversions || 0), 0);

    // Mock chart data from campaigns
    const chartData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((day, i) => ({
            name: day,
            impressions: Math.floor((totalImpressions / 7) * (0.7 + Math.random() * 0.6)),
            clicks: Math.floor((totalClicks / 7) * (0.7 + Math.random() * 0.6)),
            conversions: Math.floor((totalConversions / 7) * (0.5 + Math.random()))
        }));
    }, [totalImpressions, totalClicks, totalConversions]);

    const budgetPieData = [
        { name: 'Meta', value: budgetMeta },
        { name: 'Google', value: 100 - budgetMeta }
    ];

    const handlePublish = async () => {
        try {
            await publishAd();
            fetchCampaignStats();
        } catch (e) { /* error handled in store */ }
    };

    const handleOptimize = async () => {
        try { await optimizeNow(); } catch (e) { /* error handled in store */ }
    };

    const handlePause = async (campaignId) => {
        try { await updateCampaign(campaignId, 'pause'); } catch (e) { /* error handled in store */ }
    };

    const handleResume = async (campaignId) => {
        try { await updateCampaign(campaignId, 'resume'); } catch (e) { /* error handled in store */ }
    };

    const handleSaveBudget = async () => {
        await updateAdConfig({
            totalBudget,
            budgetSplit: { meta: budgetMeta, google: 100 - budgetMeta },
            autoOptimize: true,
            objective: activeProject?.adConfig?.objective || 'conversions'
        });
    };

    const handleFetchGrowth = async () => {
        try { await fetchGrowthSuggestions(); } catch (e) { /* error handled in store */ }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: IconChart },
        { id: 'campaigns', label: 'Campaigns', icon: IconRocket },
        { id: 'budget', label: 'Budget', icon: IconTarget },
        { id: 'growth', label: 'AI Growth', icon: IconSparkle },
    ];

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8f9fa] overflow-hidden">

            {/* ═══ Top Bar ═══ */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center px-5 shrink-0 z-20 sticky top-0">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-indigo-100/50">
                        <IconChart className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-normal text-gray-800 leading-tight">Ad Console</h1>
                        <p className="text-[11px] text-gray-400 font-normal">Publish, track and optimize ad campaigns</p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="w-[220px]">
                            <select
                                onChange={(e) => {
                                    if (e.target.value) loadProject(e.target.value);
                                    else setActiveProject(null);
                                }}
                                value={activeProject?._id || ''}
                                className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 outline-none focus:border-indigo-300 transition-colors font-normal cursor-pointer"
                            >
                                <option value="">Select a project...</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.team ? 'Team — ' : ''}{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {activeProject && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] rounded-full border border-emerald-100 font-normal">
                                {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Content ═══ */}
            {!activeProject ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                        <IconChart className="w-8 h-8 text-indigo-200" />
                    </div>
                    <h3 className="text-[14px] font-normal text-gray-700">No Project Selected</h3>
                    <p className="text-[12px] text-gray-400 font-normal mt-1">Select a project to manage ad campaigns</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* ═══ Tab Bar + Actions ═══ */}
                    <div className="shrink-0 bg-white border-b border-gray-100 px-5 flex items-center justify-between h-[52px]">
                        <div className="flex items-center gap-1">
                            {tabs.map(tab => {
                                const TabIcon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}>
                                        <TabIcon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2.5">
                            {/* Platform filter */}
                            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200/60">
                                {['all', 'meta', 'google'].map(p => (
                                    <button key={p} onClick={() => setPlatformFilter(p)}
                                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all capitalize ${platformFilter === p
                                            ? 'bg-white text-gray-800 shadow-sm border border-gray-100/50'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                        {p === 'all' ? 'All' : p === 'meta' ? 'Meta' : 'Google'}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => fetchCampaignStats()} disabled={isFetchingStats}
                                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors"
                                title="Refresh Stats">
                                <IconRefresh className={`w-4 h-4 text-gray-500 ${isFetchingStats ? 'animate-spin' : ''}`} />
                            </button>

                            <button onClick={handleOptimize} disabled={isOptimizing || campaigns.length === 0}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200/50 text-violet-700 text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                {isOptimizing ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /> Optimizing...</>
                                ) : (
                                    <><IconBolt className="w-4 h-4" /> Optimize Now</>
                                )}
                            </button>

                            <button onClick={handlePublish} disabled={isPublishing || !activeProject?.creatives?.length}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-[12px] font-medium shadow-md shadow-blue-600/20 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
                                {isPublishing ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                                ) : (
                                    <><IconRocket className="w-4 h-4" /> Publish Ad</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ═══ Error Banner ═══ */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center justify-between">
                                <p className="text-[12px] text-red-700 font-normal">{error}</p>
                                <button onClick={clearError} className="text-[11px] text-red-500 hover:text-red-700 font-medium">Dismiss</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══ Optimization Result Banner ═══ */}
                    <AnimatePresence>
                        {optimizationResult && activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-violet-50 border-b border-violet-100 px-5 py-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <IconSparkle className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[13px] text-violet-800 font-medium">AI Optimization Complete — Score: {optimizationResult.overallScore}/10</p>
                                        <p className="text-[12px] text-violet-600 font-normal mt-0.5">{optimizationResult.topInsight}</p>
                                        {optimizationResult.applied?.length > 0 && (
                                            <p className="text-[11px] text-violet-500 mt-1">{optimizationResult.applied.length} recommendation(s) auto-applied</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══ Tab Content ═══ */}
                    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E9ECEF transparent' }}>
                        <AnimatePresence mode="wait">

                            {/* ────── OVERVIEW TAB ────── */}
                            {activeTab === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                                        <StatCard icon={IconRocket} label="Active Campaigns" value={activeCampaignCount} sub={`${campaigns.length} total`} color="blue" delay={0} />
                                        <StatCard icon={IconEye} label="Impressions" value={totalImpressions.toLocaleString()} color="indigo" delay={0.05} />
                                        <StatCard icon={IconCursor} label="Clicks" value={totalClicks.toLocaleString()} color="violet" delay={0.1} />
                                        <StatCard icon={IconChart} label="CTR" value={`${avgCtr}%`} color="emerald" delay={0.15} />
                                        <StatCard icon={IconTarget} label="Conversions" value={totalConversions.toLocaleString()} color="amber" delay={0.2} />
                                        <StatCard icon={IconTarget} label="Total Spend" value={`$${totalSpend.toFixed(2)}`} color="rose" delay={0.25} />
                                    </div>

                                    {/* Charts */}
                                    {campaigns.length > 0 ? (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                            {/* Impressions & Clicks Line Chart */}
                                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                                <div className="flex items-center gap-2.5 mb-4">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                                        <IconChart className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <p className="text-[13px] text-gray-800 font-medium">Performance Trends</p>
                                                </div>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                                                        <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Conversions Bar Chart */}
                                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                                <div className="flex items-center gap-2.5 mb-4">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                        <IconTarget className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                    <p className="text-[13px] text-gray-800 font-medium">Conversions</p>
                                                </div>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-4 shadow-sm">
                                                <IconRocket className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <p className="text-gray-700 text-[15px] font-medium">No campaigns yet</p>
                                            <p className="text-gray-500 text-[13px] mt-1 font-normal max-w-[340px] text-center">
                                                {activeProject?.creatives?.length > 0
                                                    ? 'Click "Publish Ad" to launch your first campaign across Meta and Google.'
                                                    : 'Generate creatives in Ad Studio first, then come back to publish.'}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ────── CAMPAIGNS TAB ────── */}
                            {activeTab === 'campaigns' && (
                                <motion.div key="campaigns" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[14px] text-gray-800 font-medium">{campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}</p>
                                    </div>

                                    {campaigns.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {campaigns.map((campaign, idx) => (
                                                <CampaignRow
                                                    key={campaign.campaignId || idx}
                                                    campaign={campaign}
                                                    onPause={handlePause}
                                                    onResume={handleResume}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16">
                                            <IconRocket className="w-10 h-10 text-gray-300 mb-3" />
                                            <p className="text-[14px] text-gray-600 font-medium">No campaigns to display</p>
                                            <p className="text-[12px] text-gray-400 mt-1">Publish an ad to see campaigns here</p>
                                        </div>
                                    )}

                                    {/* Creative ↔ Campaign mapping */}
                                    {campaigns.length > 0 && activeProject?.creatives?.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
                                                    <IconSparkle className="w-3.5 h-3.5 text-indigo-500" />
                                                </div>
                                                <p className="text-[13px] text-gray-700 font-medium">Creative — Campaign Links</p>
                                            </div>
                                            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                                                {campaigns.filter(c => c.creativeId).map((c, i) => {
                                                    const creative = activeProject.creatives.find(cr => cr._id === c.creativeId);
                                                    return (
                                                        <div key={i} className="flex items-center gap-4 px-4 py-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                                {creative?.url && <img src={creative.url} alt="" className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] text-gray-700 font-medium truncate">{creative?.template || 'Creative'}</p>
                                                                <p className="text-[11px] text-gray-400">{creative?.style || 'Default'}</p>
                                                            </div>
                                                            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                            </svg>
                                                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${PLATFORM_COLORS[c.platform].bg} ${PLATFORM_COLORS[c.platform].text}`}>
                                                                {c.name}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ────── BUDGET TAB ────── */}
                            {activeTab === 'budget' && (
                                <motion.div key="budget" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                        {/* Budget Split */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                                            <div className="flex items-center gap-2.5 mb-5">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <IconTarget className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <p className="text-[14px] text-gray-800 font-medium">Budget Allocation</p>
                                            </div>

                                            {/* Total Budget */}
                                            <div className="mb-5">
                                                <label className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-2 block">Total Budget (USD)</label>
                                                <input type="number" value={totalBudget} onChange={e => setTotalBudget(Number(e.target.value))} min={10}
                                                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-800 font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                            </div>

                                            {/* Split Slider */}
                                            <div className="mb-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[12px] text-blue-600 font-medium">Meta: {budgetMeta}%</span>
                                                    <span className="text-[12px] text-emerald-600 font-medium">Google: {100 - budgetMeta}%</span>
                                                </div>
                                                <input type="range" min={0} max={100} value={budgetMeta} onChange={e => setBudgetMeta(Number(e.target.value))}
                                                    className="w-full h-2 accent-blue-500 cursor-pointer bg-gray-200 rounded-full" />
                                                <div className="flex mt-2 rounded-lg overflow-hidden h-3">
                                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${budgetMeta}%` }} />
                                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${100 - budgetMeta}%` }} />
                                                </div>
                                            </div>

                                            {/* Dollar amounts */}
                                            <div className="grid grid-cols-2 gap-3 mb-5">
                                                <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100/50">
                                                    <p className="text-[11px] text-blue-500 font-medium uppercase tracking-wider mb-1">Meta Budget</p>
                                                    <p className="text-[18px] text-blue-800 font-semibold">${(totalBudget * budgetMeta / 100).toFixed(2)}</p>
                                                    <p className="text-[11px] text-blue-500 font-normal">${(totalBudget * budgetMeta / 100 / 30).toFixed(2)}/day</p>
                                                </div>
                                                <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100/50">
                                                    <p className="text-[11px] text-emerald-500 font-medium uppercase tracking-wider mb-1">Google Budget</p>
                                                    <p className="text-[18px] text-emerald-800 font-semibold">${(totalBudget * (100 - budgetMeta) / 100).toFixed(2)}</p>
                                                    <p className="text-[11px] text-emerald-500 font-normal">${(totalBudget * (100 - budgetMeta) / 100 / 30).toFixed(2)}/day</p>
                                                </div>
                                            </div>

                                            <button onClick={handleSaveBudget}
                                                className="w-full h-11 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors">
                                                Save Budget Configuration
                                            </button>
                                        </div>

                                        {/* Pie Chart */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center">
                                            <p className="text-[14px] text-gray-800 font-medium mb-6">Budget Distribution</p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                                        {budgetPieData.map((_, i) => (
                                                            <Cell key={i} fill={PIE_COLORS[i]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                    <span className="text-[12px] text-gray-600 font-normal">Meta ({budgetMeta}%)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                    <span className="text-[12px] text-gray-600 font-normal">Google ({100 - budgetMeta}%)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ────── GROWTH TAB ────── */}
                            {activeTab === 'growth' && (
                                <motion.div key="growth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                                                <IconSparkle className="w-3.5 h-3.5 text-violet-500" />
                                            </div>
                                            <p className="text-[14px] text-gray-800 font-medium">AI Growth Agent</p>
                                        </div>
                                        <button onClick={handleFetchGrowth} disabled={isFetchingSuggestions}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 shadow-md shadow-violet-600/20 active:scale-[0.98]">
                                            {isFetchingSuggestions ? (
                                                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                            ) : (
                                                <><IconLightBulb className="w-4 h-4" /> Generate Suggestions</>
                                            )}
                                        </button>
                                    </div>

                                    {growthSuggestions ? (
                                        <div className="space-y-5">
                                            {/* Strategy Banner */}
                                            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100/50 p-5">
                                                <p className="text-[13px] text-violet-800 font-medium mb-1">Overall Strategy</p>
                                                <p className="text-[13px] text-violet-700 font-normal leading-relaxed">{growthSuggestions.overallStrategy}</p>
                                            </div>

                                            {/* Suggestions Grid */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {(growthSuggestions.suggestions || []).map((sug, idx) => {
                                                    const priorityStyle = sug.priority === 'high' ? 'border-l-red-500' : sug.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500';
                                                    const categoryColor = {
                                                        creative: 'bg-indigo-50 text-indigo-700',
                                                        budget: 'bg-emerald-50 text-emerald-700',
                                                        audience: 'bg-amber-50 text-amber-700',
                                                        platform: 'bg-blue-50 text-blue-700',
                                                        strategy: 'bg-violet-50 text-violet-700'
                                                    }[sug.category] || 'bg-gray-50 text-gray-700';

                                                    return (
                                                        <motion.div key={sug.id || idx}
                                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                                                            className={`bg-white rounded-xl border border-gray-100 border-l-[3px] ${priorityStyle} p-4 hover:shadow-md transition-all`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${categoryColor}`}>{sug.category}</span>
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-500 uppercase tracking-wider">{sug.priority}</span>
                                                            </div>
                                                            <p className="text-[13px] text-gray-800 font-medium mb-1">{sug.title}</p>
                                                            <p className="text-[12px] text-gray-500 font-normal leading-relaxed mb-2">{sug.description}</p>
                                                            {sug.estimatedImpact && (
                                                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                                                                    <IconChart className="w-3 h-3" />
                                                                    <span className="font-normal">{sug.estimatedImpact}</span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>

                                            {/* Next Steps */}
                                            {growthSuggestions.nextSteps?.length > 0 && (
                                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                                    <p className="text-[13px] text-gray-700 font-medium mb-3">Next Steps</p>
                                                    <div className="space-y-2">
                                                        {growthSuggestions.nextSteps.map((step, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50 shrink-0">
                                                                    <span className="text-[11px] text-blue-600 font-semibold">{i + 1}</span>
                                                                </div>
                                                                <p className="text-[12px] text-gray-600 font-normal">{step}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100/50 flex items-center justify-center mb-4 shadow-sm">
                                                <IconLightBulb className="w-7 h-7 text-violet-400" />
                                            </div>
                                            <p className="text-gray-700 text-[15px] font-medium">AI Growth Agent</p>
                                            <p className="text-gray-500 text-[13px] mt-1 font-normal max-w-[340px] text-center">
                                                Click "Generate Suggestions" to get AI-powered growth recommendations for your campaigns.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdConsole;
