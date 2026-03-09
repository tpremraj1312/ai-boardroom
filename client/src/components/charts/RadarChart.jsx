import React from 'react';
import {
    Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-board-card-2 border border-board-border p-3 rounded-lg shadow-card">
                <p className="font-semibold text-text-primary mb-2 text-center border-b border-board-border pb-1">
                    {payload[0].payload.subject}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center text-sm my-1 justify-between w-32">
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-text-secondary capitalize">{entry.name}:</span>
                        </div>
                        <span className="text-white font-mono font-medium">{entry.value}/100</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const RadarChart = ({ data }) => {
    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Your Business"
                        dataKey="user"
                        stroke="#6C63FF"
                        fill="#6C63FF"
                        fillOpacity={0.4}
                    />
                    <Radar
                        name="Market Avg"
                        dataKey="competitor"
                        stroke="#6B7280"
                        fill="#6B7280"
                        fillOpacity={0.2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </RechartsRadar>
            </ResponsiveContainer>
        </div>
    );
};

export default RadarChart;
