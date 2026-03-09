import React from 'react';
import GaugeChart from '../charts/GaugeChart';
import clsx from 'clsx';
import ProgressBar from '../ui/ProgressBar';

const InvestorReadinessPanel = ({ data }) => {
    if (!data) return null;

    const getSeverityBadge = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return <span className="bg-board-red/20 text-board-red border border-board-red/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">High Risk</span>;
            case 'medium': return <span className="bg-board-amber/20 text-board-amber border border-board-amber/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Med Risk</span>;
            case 'low': return <span className="bg-board-blue/20 text-board-blue border border-board-blue/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Low Risk</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-board-card rounded-2xl border border-board-gold/30 shadow-card p-6 col-span-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-gradient-radial from-board-gold/5 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-lg font-bold text-board-gold flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-board-gold/10 flex items-center justify-center mr-3 text-board-gold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Investor Readiness
                </h3>
            </div>

            <div className="mb-8 pt-4">
                <GaugeChart score={data.readinessScore} />
            </div>

            <div className="space-y-4 mb-8">
                {data.scoreBreakdown.map((item, idx) => (
                    <ProgressBar
                        key={idx}
                        value={item.score}
                        max={item.maxScore}
                        showLabel={false}
                        color={item.score > 70 ? 'green' : item.score > 40 ? 'amber' : 'red'}
                    />
                ))}
            </div>

            <div className="border-t border-board-border pt-6 mb-6">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Top Investor Concerns</h4>
                <div className="space-y-3">
                    {data.topConcerns.map((concern, idx) => (
                        <div key={idx} className="bg-board-darker border border-board-border rounded-lg p-3 group hover:border-text-muted transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-white">{concern.concern}</span>
                                {getSeverityBadge(concern.severity)}
                            </div>
                            <p className="text-xs text-text-muted">
                                <span className="text-text-secondary font-medium mr-1 flex items-center mb-1">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Mitigation:
                                </span>
                                {concern.mitigation}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto bg-board-darker rounded-xl border border-board-border p-4">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Pitch Checklist</h4>
                <ul className="space-y-2">
                    {data.pitchChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                            <span className={clsx(
                                'w-4 h-4 rounded-full flex items-center justify-center text-[10px] mr-3 shrink-0 border',
                                item.status === 'complete' ? 'bg-board-green border-board-green text-board-dark' :
                                    item.status === 'partial' ? 'bg-board-amber border-board-amber text-board-dark' :
                                        'bg-transparent border-board-border text-transparent'
                            )}>
                                ✓
                            </span>
                            <span className={clsx('text-xs', item.status === 'complete' ? 'text-text-primary line-through opacity-70' : 'text-text-primary font-medium')}>
                                {item.item}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default InvestorReadinessPanel;
