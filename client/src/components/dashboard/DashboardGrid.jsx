import React from 'react';
import Card from '../ui/Card';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const DashboardGrid = ({ data }) => {
    if (!data) return null;
    const { businessModel, financial, competitive, growth, investor, market } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-min max-w-[1440px] mx-auto">

            {/* ── OVERVIEW HERO ───────────────────────────────────── */}
            <Card className="col-span-1 lg:col-span-3 p-8 flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-white to-blue-50/50 border-board-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-board-primary/5 rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-board-heading mb-1 tracking-tight">Executive Strategic Assessment</h2>
                    <p className="text-sm font-medium text-board-textSecondary">AI-generated insights from your advisory board session</p>
                </div>
                <div className="mt-4 md:mt-0 text-center md:text-right relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-board-textSecondary mb-1">Investor Readiness</p>
                    <div className="flex items-baseline justify-center md:justify-end">
                        <span className="text-5xl font-black tracking-tighter text-board-primary">{investor?.readinessScore || 0}</span>
                        <span className="text-lg font-bold text-board-textSecondary ml-1">/100</span>
                    </div>
                </div>
            </Card>

            {/* ── BUSINESS MODEL ──────────────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Business Model</h3>
                <p className="text-sm text-board-textMain mb-5 leading-relaxed bg-board-bgSecondary p-3 rounded-lg border border-board-border">
                    {businessModel?.valueProp || 'Pending analysis...'}
                </p>
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider">Revenue Streams</h4>
                    {businessModel?.revenueStreams?.map((stream, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-board-textMain">{stream.name}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-board-bgSecondary rounded-full overflow-hidden">
                                    <div className="h-full bg-board-primary rounded-full" style={{ width: `${stream.percentage}%` }}></div>
                                </div>
                                <span className="font-bold text-xs text-board-heading w-8 text-right">{stream.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── FINANCIAL PROJECTIONS ───────────────────────────── */}
            <Card className="col-span-1 lg:col-span-2 p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">12-Month Financial Projections</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {financial?.keyFinancials?.slice(0, 3).map((kf, i) => (
                        <div key={i} className="bg-board-bgSecondary rounded-lg p-3 border border-board-border">
                            <p className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider">{kf.label}</p>
                            <p className="text-lg font-black text-board-heading">{kf.value}</p>
                            <span className={`text-[10px] font-bold ${kf.trend === 'up' ? 'text-green-600' : kf.trend === 'down' ? 'text-red-500' : 'text-board-textSecondary'}`}>
                                {kf.trend === 'up' ? '↑ Growing' : kf.trend === 'down' ? '↓ Declining' : '— Stable'}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financial?.monthlyProjections || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E9ECEF', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── COMPETITIVE RADAR ───────────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Competitive Positioning</h3>
                <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius="70%" data={competitive?.radarData || []}>
                            <PolarGrid stroke="#E9ECEF" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748B' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="You" dataKey="user" stroke="#2563EB" fill="#2563EB" fillOpacity={0.35} />
                            <Radar name="Competitor" dataKey="competitor" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.15} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── FULL SWOT ANALYSIS ─────────────────────────────── */}
            <Card className="col-span-1 lg:col-span-2 p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">SWOT Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                        <h4 className="text-[10px] font-black text-green-700 uppercase tracking-wider mb-2">Strengths</h4>
                        <ul className="text-xs text-green-800 space-y-1">
                            {competitive?.swot?.strengths?.slice(0, 4).map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-green-500 mt-0.5">✓</span>{s}</li>) || <li>No data</li>}
                        </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <h4 className="text-[10px] font-black text-red-700 uppercase tracking-wider mb-2">Weaknesses</h4>
                        <ul className="text-xs text-red-800 space-y-1">
                            {competitive?.swot?.weaknesses?.slice(0, 4).map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-red-500 mt-0.5">✗</span>{s}</li>) || <li>No data</li>}
                        </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">Opportunities</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            {competitive?.swot?.opportunities?.slice(0, 4).map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-blue-500 mt-0.5">→</span>{s}</li>) || <li>No data</li>}
                        </ul>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Threats</h4>
                        <ul className="text-xs text-amber-800 space-y-1">
                            {competitive?.swot?.threats?.slice(0, 4).map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-amber-500 mt-0.5">⚠</span>{s}</li>) || <li>No data</li>}
                        </ul>
                    </div>
                </div>
            </Card>

            {/* ── INVESTOR CONCERNS ──────────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Investor Concerns</h3>
                <div className="space-y-3">
                    {investor?.topConcerns?.map((c, i) => (
                        <div key={i} className="p-3 bg-board-bgSecondary rounded-xl border border-board-border">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-board-heading">{c.concern}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${c.severity === 'High' ? 'bg-red-100 text-red-700' : c.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{c.severity}</span>
                            </div>
                            <p className="text-[11px] text-board-textSecondary">{c.mitigation}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── GROWTH ROADMAP ──────────────────────────────────── */}
            <Card className="col-span-1 lg:col-span-3 p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-6 border-b border-board-border pb-2">Growth Roadmap</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {growth?.phases?.map((p, i) => (
                        <div key={i} className="relative bg-board-bgSecondary rounded-xl p-5 border border-board-border">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-green-500'}`}>
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-board-heading">{p.name}</p>
                                    <p className="text-[10px] text-board-textSecondary">{p.duration}</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <p className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider mb-1">Milestones</p>
                                <ul className="space-y-1">
                                    {p.milestones?.slice(0, 3).map((m, j) => (
                                        <li key={j} className="text-xs text-board-textMain flex items-start gap-1.5">
                                            <span className="text-board-primary mt-0.5">●</span>{m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-board-textSecondary uppercase tracking-wider mb-1">KPIs</p>
                                <div className="flex flex-wrap gap-1">
                                    {p.kpis?.slice(0, 3).map((k, j) => (
                                        <span key={j} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-board-border text-board-textMain">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── UNIT ECONOMICS ──────────────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Unit Economics</h3>
                <div className="space-y-4">
                    {[
                        { label: 'LTV (Lifetime Value)', value: `$${(growth?.unitEconomics?.ltv || 0).toLocaleString()}`, color: 'text-board-primary' },
                        { label: 'CAC (Customer Acquisition)', value: `$${(growth?.unitEconomics?.cac || 0).toLocaleString()}`, color: 'text-red-500' },
                        { label: 'LTV/CAC Ratio', value: `${(growth?.unitEconomics?.ltvCacRatio || 0).toFixed(1)}x`, color: (growth?.unitEconomics?.ltvCacRatio || 0) >= 3 ? 'text-green-600' : 'text-amber-500' },
                        { label: 'Payback Period', value: `${growth?.unitEconomics?.paybackMonths || 0} months`, color: 'text-board-heading' },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-xs text-board-textSecondary">{item.label}</span>
                            <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── FUNDING TIMELINE ────────────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Funding Timeline</h3>
                <div className="space-y-3">
                    {investor?.fundingTimeline?.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-board-primary shrink-0"></div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-board-heading">{f.milestone}</p>
                                <p className="text-[10px] text-board-textSecondary">{f.target}</p>
                            </div>
                            <span className="text-xs font-bold text-board-primary">{f.amount}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── PITCH READINESS CHECKLIST ───────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Pitch Readiness</h3>
                <div className="space-y-2">
                    {investor?.pitchChecklist?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${item.status === 'complete' ? 'bg-green-100 border-green-300 text-green-700' :
                                    item.status === 'partial' ? 'bg-amber-100 border-amber-300 text-amber-700' :
                                        'bg-red-50 border-red-200 text-red-500'
                                }`}>
                                {item.status === 'complete' ? '✓' : item.status === 'partial' ? '◐' : '✗'}
                            </div>
                            <span className="text-xs text-board-textMain">{item.item}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── REVENUE BREAKDOWN PIE ───────────────────────────── */}
            <Card className="p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Cost Structure</h3>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={businessModel?.costCategories || []} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}>
                                {businessModel?.costCategories?.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {businessModel?.costCategories?.map((c, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-board-textSecondary">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                            {c.name}
                        </span>
                    ))}
                </div>
            </Card>

            {/* ── SCORE BREAKDOWN BAR ─────────────────────────────── */}
            <Card className="col-span-1 lg:col-span-2 p-6">
                <h3 className="text-xs font-bold text-board-heading uppercase tracking-widest mb-4 border-b border-board-border pb-2">Investor Score Breakdown</h3>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={investor?.scoreBreakdown || []} layout="vertical" margin={{ left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E9ECEF" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #E9ECEF', fontSize: '12px' }} />
                            <Bar dataKey="score" fill="#2563EB" radius={[0, 6, 6, 0]} maxBarSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

        </div>
    );
};

export default DashboardGrid;
