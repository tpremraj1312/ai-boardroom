import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WalkthroughView = ({ walkthrough, validationReport, debugLog, onRegenerate, isLoading }) => {
    const [activeSection, setActiveSection] = useState(0);
    const [activeTab, setActiveTab] = useState('walkthrough'); // walkthrough | validation | debug

    if (!walkthrough && !validationReport) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50/50">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-board-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-normal text-gray-700 mb-1">No walkthrough yet</h3>
                    <p className="text-[13px] text-gray-500 font-normal">
                        Generate code first. The walkthrough is auto-generated after the build completes.
                    </p>
                </div>
            </div>
        );
    }

    const sections = walkthrough?.sections || [];
    const keyFiles = walkthrough?.keyFiles || [];
    const apiEndpoints = walkthrough?.apiEndpoints || [];
    const techStack = walkthrough?.techStack || {};

    return (
        <div className="h-full flex overflow-hidden bg-gray-50/50">
            {/* Left Nav — Section List */}
            <div className="w-[220px] flex-shrink-0 border-r border-gray-100 bg-white flex flex-col">
                {/* Tab Switcher */}
                <div className="p-2 border-b border-gray-100 flex gap-1">
                    {[
                        { key: 'walkthrough', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Guide' },
                        { key: 'validation', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Checks' },
                        { key: 'debug', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Debug' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-1.5 text-[10px] rounded-md transition-all flex flex-col items-center gap-0.5 ${
                                activeTab === tab.key
                                    ? 'bg-board-primary/8 text-board-primary'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Section Navigation */}
                {activeTab === 'walkthrough' && (
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {sections.map((section, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveSection(i)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all ${
                                    activeSection === i
                                        ? 'bg-board-primary/8 text-board-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                {section.heading}
                            </button>
                        ))}

                        {keyFiles.length > 0 && (
                            <button
                                onClick={() => setActiveSection('files')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all ${
                                    activeSection === 'files'
                                        ? 'bg-board-primary/8 text-board-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                Key Files
                            </button>
                        )}

                        {apiEndpoints.length > 0 && (
                            <button
                                onClick={() => setActiveSection('api')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all ${
                                    activeSection === 'api'
                                        ? 'bg-board-primary/8 text-board-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                API Endpoints
                            </button>
                        )}
                    </div>
                )}

                {/* Regenerate button */}
                {onRegenerate && (
                    <div className="p-2 border-t border-gray-100">
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-100 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                            Regenerate
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel — Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">

                        {/* ── Walkthrough Tab ─────────────────────── */}
                        {activeTab === 'walkthrough' && (
                            <motion.div
                                key={`section-${activeSection}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Tech Stack Header */}
                                {activeSection === 0 && Object.keys(techStack).length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        {Object.entries(techStack).map(([key, value]) => (
                                            <div key={key} className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1 font-medium">{key}</span>
                                                <span className="text-[12px] text-gray-700 font-normal">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Section Content */}
                                {typeof activeSection === 'number' && sections[activeSection] && (
                                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                        <h2 className="text-[15px] text-gray-800 font-medium mb-4">{sections[activeSection].heading}</h2>
                                        <div className="prose prose-sm max-w-none text-[13px] text-gray-600 leading-relaxed">
                                            {sections[activeSection].content.split('\n').map((line, i) => {
                                                if (line.startsWith('## ')) return <h3 key={i} className="text-[14px] text-gray-700 font-medium mt-4 mb-2">{line.replace('## ', '')}</h3>;
                                                if (line.startsWith('### ')) return <h4 key={i} className="text-[13px] text-gray-700 font-medium mt-3 mb-1">{line.replace('### ', '')}</h4>;
                                                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-1">{line.replace(/^[-*]\s/, '')}</li>;
                                                if (line.trim() === '') return <br key={i} />;
                                                if (line.includes('`')) {
                                                    const parts = line.split('`');
                                                    return (
                                                        <p key={i} className="mb-2">
                                                            {parts.map((part, j) =>
                                                                j % 2 === 1
                                                                    ? <code key={j} className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono text-indigo-600">{part}</code>
                                                                    : <span key={j}>{part}</span>
                                                            )}
                                                        </p>
                                                    );
                                                }
                                                return <p key={i} className="mb-2">{line}</p>;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Key Files View */}
                                {activeSection === 'files' && (
                                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                        <h2 className="text-[15px] text-gray-800 font-medium mb-4">Key Files</h2>
                                        <div className="space-y-2">
                                            {keyFiles.map((kf, i) => (
                                                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-medium mt-0.5 shrink-0 ${
                                                        kf.importance === 'high' ? 'bg-rose-100/50 text-rose-600' :
                                                        kf.importance === 'medium' ? 'bg-amber-100/50 text-amber-600' :
                                                        'bg-gray-200/50 text-gray-600'
                                                    }`}>
                                                        {kf.importance}
                                                    </span>
                                                    <div>
                                                        <span className="text-[13px] text-gray-800 font-mono block mb-0.5">{kf.file}</span>
                                                        <span className="text-[12px] text-gray-500">{kf.purpose}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* API Endpoints View */}
                                {activeSection === 'api' && (
                                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                        <h2 className="text-[15px] text-gray-800 font-medium mb-4">API Endpoints</h2>
                                        <div className="space-y-2">
                                            {apiEndpoints.map((ep, i) => (
                                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium shrink-0 ${
                                                        ep.method === 'GET' ? 'bg-emerald-100/50 text-emerald-600' :
                                                        ep.method === 'POST' ? 'bg-blue-100/50 text-blue-600' :
                                                        ep.method === 'PUT' || ep.method === 'PATCH' ? 'bg-amber-100/50 text-amber-600' :
                                                        'bg-red-100/50 text-red-600'
                                                    }`}>
                                                        {ep.method}
                                                    </span>
                                                    <span className="text-[13px] text-gray-800 font-mono">{ep.path}</span>
                                                    <span className="text-[12px] text-gray-400 ml-auto">{ep.purpose}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Validation Tab ──────────────────────── */}
                        {activeTab === 'validation' && (
                            <motion.div
                                key="validation"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {validationReport ? (
                                    <div className="space-y-4">
                                        {/* Status Banner */}
                                        <div className={`px-5 py-4 rounded-xl border ${
                                            validationReport.passed
                                                ? 'bg-emerald-50 border-emerald-100'
                                                : 'bg-amber-50 border-amber-100'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${validationReport.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                <span className={`text-[14px] font-medium ${validationReport.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                    {validationReport.passed ? 'All Checks Passed' : 'Issues Found'}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-gray-600">
                                                {validationReport.errors} errors, {validationReport.warnings} warnings, {validationReport.infos} info
                                            </p>
                                        </div>

                                        {/* Issues List */}
                                        {validationReport.issues && validationReport.issues.length > 0 && (
                                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                                <h3 className="text-[14px] text-gray-800 font-medium mb-3">Issues ({validationReport.issues.length})</h3>
                                                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                                                    {validationReport.issues.map((issue, i) => (
                                                        <div key={i} className={`px-4 py-3 rounded-lg border text-[12px] ${
                                                            issue.severity === 'error' ? 'bg-red-50/50 border-red-100 text-red-700' :
                                                            issue.severity === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-700' :
                                                            'bg-gray-50 border-gray-100 text-gray-600'
                                                        }`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] uppercase font-medium opacity-70">{issue.severity}</span>
                                                                <span className="text-[10px] font-mono opacity-50">{issue.type}</span>
                                                            </div>
                                                            <p className="font-mono text-[11px] opacity-80 mb-0.5">{issue.file}</p>
                                                            <p>{issue.detail}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 text-[13px]">
                                        No validation report available. Generate code first.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Debug Log Tab ────────────────────────── */}
                        {activeTab === 'debug' && (
                            <motion.div
                                key="debug"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {debugLog && debugLog.length > 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                        <h3 className="text-[14px] text-gray-800 font-medium mb-4">Debugger Agent Log</h3>
                                        <div className="space-y-3">
                                            {debugLog.map((entry, i) => (
                                                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                        entry.phase === 'validation' ? 'bg-blue-100 text-blue-500' :
                                                        entry.phase === 'fix' ? 'bg-emerald-100 text-emerald-500' :
                                                        'bg-red-100 text-red-500'
                                                    }`}>
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d={entry.phase === 'fix' ? 'M5 13l4 4L19 7' :
                                                                   entry.phase === 'error' ? 'M6 18L18 6M6 6l12 12' :
                                                                   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[12px] text-gray-700 font-medium">
                                                                Cycle {entry.cycle} — {entry.phase === 'validation' ? 'Validation' : entry.phase === 'fix' ? 'Auto-Fix' : 'Error'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-gray-500">
                                                            {entry.phase === 'validation' && `Found ${entry.errors} errors, ${entry.warnings} warnings — ${entry.passed ? 'Passed' : 'Needs fixes'}`}
                                                            {entry.phase === 'fix' && `Applied ${entry.fixesApplied} fix(es). ${entry.summary || ''}`}
                                                            {entry.phase === 'error' && entry.error}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400 font-mono">{entry.timestamp}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 text-[13px]">
                                        No debug log available. The debugger runs automatically during code generation.
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WalkthroughView;
