import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const SWOTQuadrant = ({ title, items, type, delay }) => {
    const styles = {
        strengths: 'bg-board-green/5 border-board-green/20 text-board-green',
        weaknesses: 'bg-board-red/5 border-board-red/20 text-board-red',
        opportunities: 'bg-board-blue/5 border-board-blue/20 text-board-blue',
        threats: 'bg-board-amber/5 border-board-amber/20 text-board-amber',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className={clsx('relative p-4 rounded-xl border', styles[type])}
        >
            <div className="absolute top-0 right-0 p-3 opacity-20 text-4xl font-black italic">
                {title.charAt(0)}
            </div>
            <h4 className="font-bold text-sm tracking-wide uppercase mb-3 text-current">
                {title}
            </h4>
            <ul className="space-y-2 text-sm text-text-primary h-full">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                        <span className="mr-2 mt-1 text-[8px] opacity-70">⬤</span>
                        <span className="leading-snug">{item}</span>
                    </li>
                ))}
                {items.length === 0 && (
                    <li className="text-text-muted italic text-xs">No specific points identified.</li>
                )}
            </ul>
        </motion.div>
    );
};

const CompetitorChart = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            <SWOTQuadrant title="Strengths" type="strengths" items={data.strengths || []} delay={0.1} />
            <SWOTQuadrant title="Weaknesses" type="weaknesses" items={data.weaknesses || []} delay={0.2} />
            <SWOTQuadrant title="Opportunities" type="opportunities" items={data.opportunities || []} delay={0.3} />
            <SWOTQuadrant title="Threats" type="threats" items={data.threats || []} delay={0.4} />
        </div>
    );
};

export default CompetitorChart;
