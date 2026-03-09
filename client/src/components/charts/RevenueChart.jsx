import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-board-card-2 border border-board-border p-3 rounded-lg shadow-card">
                <p className="font-semibold text-text-primary mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center text-sm my-1">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-text-secondary w-20 capitalize">{entry.name}:</span>
                        <span className="text-white font-mono font-medium">${entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const RevenueChart = ({ data, breakEvenMonth }) => {
    return (
        <div className="w-full h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#6B7280"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#6B7280"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    {breakEvenMonth && (
                        <ReferenceLine
                            x={`Month ${breakEvenMonth}`}
                            stroke="#F59E0B"
                            strokeDasharray="3 3"
                            label={{ position: 'top', value: 'Break-Even', fill: '#F59E0B', fontSize: 12 }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="costs"
                        name="Costs"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="profit"
                        name="Profit"
                        stroke="#6C63FF"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#6C63FF', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
