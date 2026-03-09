import React from 'react';
import GrowthChart from '../charts/GrowthChart';

const GrowthStrategyPanel = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-board-card rounded-2xl border border-board-border shadow-card p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-gold/10 flex items-center justify-center mr-3 text-board-gold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </span>
                    Growth Strategy & Timeline
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {data.phases.map((phase, idx) => (
                    <div key={idx} className="bg-board-darker border border-board-border rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-board-gold/5 rounded-full -translate-y-12 translate-x-12 group-hover:bg-board-gold/10 transition-colors"></div>
                        <div className="flex justify-between items-center mb-4 border-b border-board-border pb-3">
                            <h4 className="font-bold text-lg text-white">{phase.name}</h4>
                            <span className="text-xs font-semibold text-text-muted bg-white/5 px-2 py-1 rounded">{phase.duration}</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Key Milestones</p>
                                <ul className="space-y-1.5">
                                    {phase.milestones.map((milestone, i) => (
                                        <li key={i} className="flex items-start text-sm text-text-primary">
                                            <span className="text-board-gold mr-2 text-xs opacity-70 mt-0.5">■</span>
                                            <span className="leading-snug">{milestone}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-4">Target KPIs</p>
                                <div className="flex flex-wrap gap-2">
                                    {phase.kpis.map((kpi, i) => (
                                        <span key={i} className="text-[11px] font-medium bg-board-gold/10 text-board-gold px-2 py-1 rounded-full border border-board-gold/20">
                                            {kpi}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-board-border pt-6">
                <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Unit Economics</h4>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-board-card-2 rounded-lg p-3 border border-board-border text-center">
                            <p className="text-xs text-text-muted mb-1">LTV</p>
                            <p className="font-mono text-lg font-bold text-white">${data.unitEconomics.ltv.toLocaleString()}</p>
                        </div>
                        <div className="bg-board-card-2 rounded-lg p-3 border border-board-border text-center">
                            <p className="text-xs text-text-muted mb-1">CAC</p>
                            <p className="font-mono text-lg font-bold text-white">${data.unitEconomics.cac.toLocaleString()}</p>
                        </div>
                        <div className="bg-board-card-2 rounded-lg p-3 border border-board-border text-center">
                            <p className="text-xs text-text-muted mb-1">LTV:CAC Ratio</p>
                            <p className="font-mono text-lg font-bold text-board-green">{data.unitEconomics.ltvCacRatio}:1</p>
                        </div>
                        <div className="bg-board-card-2 rounded-lg p-3 border border-board-border text-center">
                            <p className="text-xs text-text-muted mb-1">Payback</p>
                            <p className="font-mono text-lg font-bold text-white">{data.unitEconomics.paybackMonths} mo</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">Acquisition Channels</h4>
                    <GrowthChart data={data.channels} />
                </div>
            </div>
        </div>
    );
};

export default GrowthStrategyPanel;
