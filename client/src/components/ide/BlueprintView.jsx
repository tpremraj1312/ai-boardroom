import React from 'react';
import { motion } from 'framer-motion';

const BlueprintView = ({ blueprint, onGenerateCode, isGenerating }) => {
    if (!blueprint) return null;

    const pages = blueprint.frontend?.pages || [];
    const components = blueprint.frontend?.components || [];
    const routes = blueprint.backend?.routes || [];
    const models = blueprint.backend?.models || [];
    const features = blueprint.features || [];

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
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-board-primary/8 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h2 className="text-lg text-board-heading font-normal">{blueprint.name}</h2>
                    <p className="text-sm text-gray-500 mt-1 font-normal">{blueprint.description}</p>
                </div>

                {/* Blueprint Sections */}
                <div className="space-y-4">
                    {/* Pages */}
                    {pages.length > 0 && (
                        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-board-textMain font-normal">Pages ({pages.length})</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {pages.map((page, i) => (
                                    <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="text-[12px] text-board-textMain font-normal">{page.name || page}</span>
                                        {page.path && <span className="text-[11px] text-gray-400 ml-2 font-normal">{page.path}</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Components */}
                    {components.length > 0 && (
                        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                    </svg>
                                </div>
                                <span className="text-sm text-board-textMain font-normal">Components ({components.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {components.map((comp, i) => (
                                    <span key={i} className="px-2.5 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[12px] border border-purple-100 font-normal">
                                        {comp.name || comp}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* API Routes */}
                    {routes.length > 0 && (
                        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-board-textMain font-normal">API Routes ({routes.length})</span>
                            </div>
                            <div className="space-y-1.5">
                                {routes.map((route, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal uppercase
                                            ${route.method === 'GET' ? 'bg-blue-50 text-blue-600' :
                                              route.method === 'POST' ? 'bg-green-50 text-green-600' :
                                              route.method === 'PUT' ? 'bg-amber-50 text-amber-600' :
                                              route.method === 'DELETE' ? 'bg-red-50 text-red-600' :
                                              'bg-gray-100 text-gray-500'}`}
                                        >
                                            {route.method || 'GET'}
                                        </span>
                                        <span className="text-[12px] text-board-textMain font-mono font-normal">{route.path || route}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Models */}
                    {models.length > 0 && (
                        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <span className="text-sm text-board-textMain font-normal">Database Models ({models.length})</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {models.map((model, i) => (
                                    <div key={i} className="px-3 py-2 bg-amber-50/50 rounded-lg border border-amber-100">
                                        <span className="text-[12px] text-amber-700 font-normal">{model.name || model}</span>
                                        {model.fields && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {(Array.isArray(model.fields) ? model.fields.slice(0, 4) : []).map((f, j) => (
                                                    <span key={j} className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded font-normal">
                                                        {f.name || f}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-gray-100 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-board-textMain font-normal">Features ({features.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((feat, i) => (
                                    <span key={i} className="px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[12px] border border-rose-100 font-normal">
                                        {feat}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Generate Code CTA */}
                <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible"
                    className="mt-6 text-center"
                >
                    <button
                        onClick={onGenerateCode}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-board-primary text-white rounded-xl hover:bg-board-primaryHover disabled:opacity-50 transition-all text-sm font-normal shadow-sm hover:shadow-md"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Generating Code...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Generate Code from Blueprint
                            </>
                        )}
                    </button>
                    <p className="text-[11px] text-gray-400 mt-2 font-normal">This will create all project files based on the blueprint above</p>
                </motion.div>
            </div>
        </div>
    );
};

export default BlueprintView;
