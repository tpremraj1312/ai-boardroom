import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import clsx from 'clsx';

const GaugeChart = ({ score }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, score, { duration: 1.5, ease: "easeOut" });
        return animation.stop;
    }, [score, count]);

    // SVG parameters
    const cx = 100;
    const cy = 100;
    const r = 80;
    const strokeWidth = 14;

    // Calculate arc paths
    const calculateArc = (startPercentage, endPercentage) => {
        // 0 to 100 maps to 180deg to 0deg (left to right semicircle)
        const startAngle = 180 - (startPercentage * 1.8);
        const endAngle = 180 - (endPercentage * 1.8);

        // Convert to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy - r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy - r * Math.sin(endRad);

        const largeArcFlag = 0; // Semicircle maximum is <= 180deg

        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    };

    const getScoreColor = (val) => {
        if (val < 41) return '#EF4444'; // Red
        if (val < 71) return '#F59E0B'; // Amber
        return '#10B981'; // Green
    };

    const currentAngle = 180 - (score * 1.8);

    return (
        <div className="relative w-full max-w-[240px] mx-auto aspect-[2/1] overflow-hidden flex flex-col items-center justify-end">
            <svg
                viewBox="0 0 200 110"
                className="w-full h-full drop-shadow-lg"
            >
                {/* Background track */}
                <path d={calculateArc(0, 100)} fill="none" stroke="#1F2937" strokeWidth={strokeWidth} strokeLinecap="round" />

                {/* Red Zone (0-40) */}
                <path d={calculateArc(0, 40)} fill="none" stroke="#EF4444" strokeWidth={strokeWidth} strokeLinecap="round" className="opacity-80" />

                {/* Amber Zone (40-70) */}
                <path d={calculateArc(40, 70)} fill="none" stroke="#F59E0B" strokeWidth={strokeWidth} strokeLinecap="round" className="opacity-80" />

                {/* Green Zone (70-100) */}
                <path d={calculateArc(70, 100)} fill="none" stroke="#10B981" strokeWidth={strokeWidth} strokeLinecap="round" className="opacity-80" />

                {/* Needle */}
                <motion.g
                    initial={{ rotate: -90 }}
                    animate={{ rotate: (score * 1.8) - 90 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ originX: '100px', originY: '100px' }}
                >
                    {/* Default needle shape pointing up (0deg relative to group) */}
                    <polygon points="96,100 104,100 100,28" fill="#F9FAFB" />
                    <circle cx={cx} cy={cy} r={8} fill="#F9FAFB" stroke="#0A0E1A" strokeWidth="2" />
                </motion.g>
            </svg>

            {/* Score Text */}
            <div className="absolute bottom-1 w-full text-center">
                <motion.div
                    className="text-4xl font-display font-black tracking-tighter"
                    style={{ color: getScoreColor(score) }}
                >
                    {rounded}
                </motion.div>
                <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mt-0.5">
                    Readiness
                </div>
            </div>
        </div>
    );
};

export default GaugeChart;
