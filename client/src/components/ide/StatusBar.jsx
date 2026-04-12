import React from 'react';
import { motion } from 'framer-motion';

const PHASE_CONFIG = {
    idle: { label: 'Ready', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' },
    blueprint: { label: 'Planning...', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500 animate-pulse' },
    codegen: { label: 'Generating...', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500 animate-pulse' },
    deploying: { label: 'Deploying...', color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500 animate-pulse' },
};

const StatusBar = ({
    status,
    generationPhase,
    activeFile,
    fileCount,
    version,
    validationReport,
    deployedUrl,
    unsavedCount,
    onExport,
    onDeploy,
    onValidate,
}) => {
    const phase = PHASE_CONFIG[generationPhase] || PHASE_CONFIG.idle;
    const hasErrors = validationReport && !validationReport.passed;
    const errorCount = validationReport?.errors || 0;
    const warningCount = validationReport?.warnings || 0;

    return (
        <div className="h-[26px] bg-board-primary flex items-center justify-between px-3 text-[11px] text-white/90 font-normal shrink-0 select-none">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${generationPhase !== 'idle' ? 'bg-white/10' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${phase.dot}`}></span>
                    <span className="font-normal">{phase.label}</span>
                </div>

                {/* Branch/Version */}
                <div className="flex items-center gap-1 text-white/70">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <span>v{version || 1}</span>
                </div>

                {/* Validation Status */}
                {validationReport && (
                    <button
                        onClick={onValidate}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-colors ${
                            hasErrors ? 'text-red-300 hover:bg-red-500/20' : 'text-green-300 hover:bg-green-500/20'
                        }`}
                        title="Click to re-validate"
                    >
                        {hasErrors ? (
                            <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <span>{errorCount}E {warningCount}W</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Passed</span>
                            </>
                        )}
                    </button>
                )}

                {/* Unsaved indicator */}
                {unsavedCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {unsavedCount} unsaved
                    </span>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* File count */}
                <span className="text-white/60 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {fileCount || 0} files
                </span>

                {/* Deployed URL */}
                {deployedUrl && (
                    <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-300 hover:text-green-200 transition-colors"
                        title="Open deployed site"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Live
                    </a>
                )}

                {/* Export */}
                <button
                    onClick={onExport}
                    className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                    title="Download ZIP"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                </button>

                {/* Deploy */}
                <button
                    onClick={onDeploy}
                    disabled={generationPhase !== 'idle' || !fileCount}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                    title="Deploy to production"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                    Deploy
                </button>
            </div>
        </div>
    );
};

export default StatusBar;
