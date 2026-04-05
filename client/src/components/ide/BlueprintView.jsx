import React from 'react';
import { motion } from 'framer-motion';

const BlueprintView = ({ blueprint, onGenerateCode, isGenerating }) => {
    if (!blueprint) return null;

    const filePlan = blueprint.file_plan || [];
    const features = blueprint.features || [];
    const uiUx = blueprint.ui_ux_system || {};
    const architecture = blueprint.architecture || {};

    const sectionVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' }
        })
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-50/50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 border border-indigo-100/50 shadow-sm">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h2 className="text-[16px] text-gray-800 font-medium">STAGE 1: Architectural Plan</h2>
                    <p className="text-[13px] text-gray-500 mt-2 font-normal max-w-2xl mx-auto leading-relaxed">{blueprint.intent_summary}</p>
                </div>

                {/* Blueprint Sections */}
                <div className="space-y-5">

                    {/* Architecture overview */}
                    <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible"
                        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <span className="text-[14px] text-gray-800 font-medium">System Architecture</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-medium">Frontend</span>
                                <span className="text-[13px] text-gray-700 font-normal">{architecture.frontend || 'React'}</span>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-medium">Backend</span>
                                <span className="text-[13px] text-gray-700 font-normal">{architecture.backend || 'Node.js'}</span>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-medium">Database</span>
                                <span className="text-[13px] text-gray-700 font-normal">{architecture.database || 'MongoDB'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* UI / UX */}
                    <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
                        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100/50">
                                <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <span className="text-[14px] text-gray-800 font-medium">UI/UX Strategy</span>
                        </div>
                        <div className="px-4 py-3 bg-[#fdfcff] rounded-lg border border-purple-50 mb-3">
                            <span className="text-[13px] text-gray-700 font-normal leading-relaxed">{uiUx.design_language || 'Professional.'}</span>
                        </div>
                    </motion.div>

                    {/* File Plan */}
                    {filePlan.length > 0 && (
                        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-[14px] text-gray-800 font-medium">File Generation Plan ({filePlan.length} files)</span>
                            </div>
                            <div className="space-y-2">
                                {filePlan.map((file, i) => (
                                    <div key={i} className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-medium mt-0.5 shrink-0 ${file.operation === 'create' ? 'bg-emerald-100/50 text-emerald-600' :
                                                file.operation === 'modify' ? 'bg-amber-100/50 text-amber-600' :
                                                    file.operation === 'delete' ? 'bg-red-100/50 text-red-600' :
                                                        'bg-gray-200/50 text-gray-600'
                                            }`}
                                        >
                                            {file.operation || 'create'}
                                        </span>
                                        <div>
                                            <span className="text-[13px] text-gray-800 font-normal font-mono block mb-1">{file.file_path}</span>
                                            <span className="text-[12px] text-gray-500 font-normal">{file.purpose}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100/50">
                                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <span className="text-[14px] text-gray-800 font-medium">Core Features</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((feat, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-rose-50/50 text-rose-600 rounded-lg text-[12px] border border-rose-100/50 font-normal">
                                        {feat}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Generate Code CTA */}
                <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible"
                    className="mt-8 text-center pb-6"
                >
                    <button
                        onClick={onGenerateCode}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all text-[13px] font-medium shadow-md shadow-gray-900/10 active:scale-[0.98]"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="w-4 h-4 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Executing STAGE 2...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Execute Plan (STAGE 2: GEMINI)
                            </>
                        )}
                    </button>
                    <p className="text-[11px] text-gray-400 mt-2.5 font-normal">Requires ~60s to generate the source files securely</p>
                </motion.div>
            </div>
        </div>
    );
};

export default BlueprintView;
