import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-board-card-2 border border-board-border p-3 rounded-lg shadow-card">
                <p className="font-semibold text-text-primary mb-2 border-b border-board-border pb-1">{label}</p>
                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between w-32">
                        <span className="text-text-secondary">Est. CAC:</span>
                        <span className="text-white font-mono">${data.cac}</span>
                    </div>
                    <div className="flex justify-between w-32">
                        <span className="text-text-secondary">Potential:</span>
                        <span className="text-white font-medium">{data.potential}</span>
                    </div>
                    <div className="flex justify-between w-32">
                        <span className="text-text-secondary">Timeline:</span>
                        <span className="text-white">{data.timeline}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const GrowthChart = ({ data }) => {
    // Sort by highest potential or lowest CAC if needed

    const getBarColor = (potential) => {
        switch (potential?.toLowerCase()) {
            case 'high': return '#10B981';
            case 'medium': return '#6C63FF';
            case 'low': return '#6B7280';
            default: return '#3B82F6';
        }
    };

    return (
        <div className="w-full h-64 mt-4">
            <p className="text-xs text-text-muted mb-2 text-right">Estimated CAC ($) by Channel</p>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#6B7280" tick={{ fill: '#F9FAFB', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1F2937', opacity: 0.4 }} />
                    <Bar dataKey="cac" radius={[0, 4, 4, 0]} maxBarSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.potential)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GrowthChart;
