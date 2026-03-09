import React from 'react';
import { motion } from 'framer-motion';

const MarketSizeChart = ({ tam, sam, som, tamLabel }) => {
    const formatValue = (val) => {
        if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
        return `$${val.toLocaleString()}`;
    };

    return (
        <div className="relative w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center py-4">
            {/* TAM Circle */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-board-accent/20 bg-board-accent/5 flex items-start justify-center pt-8 shadow-[0_0_30px_rgba(108,99,255,0.1)]"
            >
                <div className="text-center mt-2">
                    <p className="text-xs text-text-muted font-medium mb-0.5">TAM ({tamLabel || 'Total Market'})</p>
                    <p className="text-sm font-bold text-board-accent-2">{formatValue(tam)}</p>
                </div>
            </motion.div>

            {/* SAM Circle */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="absolute inset-[15%] rounded-full border border-board-blue/30 bg-board-blue/10 flex items-start justify-center pt-8 mt-2"
            >
                <div className="text-center">
                    <p className="text-xs text-text-muted font-medium mb-0.5">SAM (Serviceable)</p>
                    <p className="text-sm font-bold text-board-blue">{formatValue(sam)}</p>
                </div>
            </motion.div>

            {/* SOM Circle */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="absolute inset-[35%] rounded-full border-2 border-board-green bg-board-green/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-6"
            >
                <div className="text-center">
                    <p className="text-[10px] text-board-green font-bold uppercase tracking-wider mb-0.5">SOM (Target)</p>
                    <p className="text-base font-black text-white">{formatValue(som)}</p>
                </div>
            </motion.div>
        </div>
    );
};

export default MarketSizeChart;
