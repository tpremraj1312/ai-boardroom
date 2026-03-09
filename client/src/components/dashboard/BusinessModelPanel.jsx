import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';

const BusinessModelPanel = ({ data }) => {
    if (!data) return null;

    const COLORS = ['#6C63FF', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

    return (
        <div className="flex flex-col h-full bg-board-card rounded-2xl border border-board-border shadow-card p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-accent/10 flex items-center justify-center mr-3 text-board-accent">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </span>
                    Business Model Definition
                </h3>
            </div>

            <div className="bg-board-darker rounded-xl p-5 border border-board-border mb-6 shadow-inner-glow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-accent"></div>
                <p className="text-sm text-text-muted mb-2 font-medium uppercase tracking-wider">Core Value Proposition</p>
                <p className="text-base sm:text-lg text-white font-medium italic leading-relaxed">
                    "{data.valueProp}"
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-4 border-b border-board-border pb-2">Revenue Streams</h4>
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.revenueStreams}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="percentage"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {data.revenueStreams.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1A2234', borderColor: '#1F2937', borderRadius: '8px' }}
                                    itemStyle={{ color: '#F9FAFB' }}
                                    formatter={(value) => [`${value}%`, 'Share']}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Custom Legend */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                            {data.revenueStreams.map((stream, idx) => (
                                <div key={idx} className="flex items-center text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                    <span className="text-text-primary mr-1">{stream.name}</span>
                                    <span className="text-text-muted font-mono">{stream.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-4 border-b border-board-border pb-2">Cost Structure</h4>
                    <div className="space-y-3 mt-2">
                        {data.costCategories.map((cost, idx) => (
                            <div key={idx} className="w-full">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-text-primary">{cost.name}</span>
                                    <span className="text-text-muted font-mono">{cost.percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-board-darker rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cost.percentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-board-red shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto border-t border-board-border pt-6">
                {data.keyMetrics.map((metric, idx) => (
                    <div key={idx} className="text-center">
                        <p className="text-xs text-text-muted font-medium mb-1">{metric.label}</p>
                        <p className="text-lg font-bold text-white tracking-tight">{metric.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessModelPanel;
