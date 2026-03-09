import React from 'react';
import MarketSizeChart from '../charts/MarketSizeChart';

const MarketAnalysisPanel = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex flex-col bg-board-card rounded-2xl border border-board-border shadow-card p-6 h-full col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-blue/10 flex items-center justify-center mr-3 text-board-blue">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Market Sizing
                </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center mb-6">
                <MarketSizeChart tam={data.tam} sam={data.sam} som={data.som} tamLabel={data.tamLabel} />
            </div>

            <div className="bg-board-darker rounded-xl border border-board-border p-5 mt-auto">
                <h4 className="text-sm font-semibold text-text-secondary mb-3 border-b border-board-border pb-2">Demand Trend</h4>
                <div className="flex justify-between items-end">
                    {data.demandTrend.map((point, idx) => {
                        const maxVal = Math.max(...data.demandTrend.map(d => d.value));
                        const height = `${(point.value / maxVal) * 100}%`;
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1">
                                <div className="w-full flex justify-center h-16 items-end pb-1">
                                    <div className="w-2/3 bg-board-blue hover:bg-board-accent transition-colors rounded-t-sm" style={{ height }}></div>
                                </div>
                                <span className="text-[10px] text-text-muted mt-1">{point.year}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysisPanel;
