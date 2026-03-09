import React from 'react';
import RadarChart from '../charts/RadarChart';
import CompetitorChart from '../charts/CompetitorChart';

const CompetitivePanel = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex flex-col bg-board-card rounded-2xl border border-board-border shadow-card p-6 h-full col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-accent/10 flex items-center justify-center mr-3 text-board-accent">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                    </span>
                    Competitive Intelligence
                </h3>
            </div>

            <div className="bg-board-darker rounded-xl border border-board-border overflow-hidden mb-6 relative py-4">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider absolute top-4 left-4 z-10">
                    Positioning Radar
                </h4>
                <RadarChart data={data.radarData} />
            </div>

            <div className="flex-1 border-t border-board-border pt-6">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                    SWOT Analysis
                </h4>
                <CompetitorChart data={data.swot} />
            </div>
        </div>
    );
};

export default CompetitivePanel;
