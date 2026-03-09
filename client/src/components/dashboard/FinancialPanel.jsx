import React from 'react';
import RevenueChart from '../charts/RevenueChart';

const FinancialPanel = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-board-card rounded-2xl border border-board-border shadow-card p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-green/10 flex items-center justify-center mr-3 text-board-green">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Financial Projections
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {data.keyFinancials.map((metric, idx) => (
                    <div key={idx} className="bg-board-darker border border-board-border rounded-xl p-4">
                        <p className="text-xs text-text-muted font-medium mb-1">{metric.label}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-xl font-mono font-bold text-white">{metric.value}</p>
                            {metric.trend === 'up' && <span className="text-board-green text-xs flex items-center">↑</span>}
                            {metric.trend === 'down' && <span className="text-board-red text-xs flex items-center">↓</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 min-h-[300px] mb-6 border border-board-border rounded-xl p-4 bg-board-darker relative">
                <h4 className="text-sm font-medium text-text-secondary absolute top-4 left-4">12-Month Forecast (USD)</h4>
                <RevenueChart data={data.monthlyProjections} breakEvenMonth={data.breakEvenMonth} />
            </div>

            <div className="border-t border-board-border pt-6">
                <h4 className="text-sm font-semibold text-text-secondary mb-4">Funding Roadmap</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                    {data.fundingPhases.map((phase, idx) => (
                        <div key={idx} className="flex-1 bg-board-darker border border-board-border rounded-xl p-4 relative overflow-hidden group hover:border-board-green/50 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-board-border group-hover:bg-board-green transition-colors"></div>
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-semibold">{phase.phase}</p>
                            <p className="text-lg font-mono font-bold text-board-green mb-1">${(phase.amount / 1000000).toFixed(1)}M</p>
                            <p className="text-xs text-text-primary capitalize">{phase.purpose}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinancialPanel;
