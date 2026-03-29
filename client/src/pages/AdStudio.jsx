import React, { useEffect } from 'react';
import useProjectStore from '../store/projectStore';
import CreativeStudio from '../components/ide/CreativeStudio';

const AdStudio = () => {
    const {
        projects,
        activeProject,
        fetchProjects,
        loadProject,
        setActiveProject
    } = useProjectStore();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8f9fa] overflow-hidden">
            {/* Top Bar for Project Selection */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center px-5 shrink-0 z-20 sticky top-0">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border border-indigo-100/50">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[14px] font-normal text-gray-800 leading-tight">AI Creative Studio</h1>
                        <p className="text-[11px] text-gray-400 font-normal">Campaign-ready poster generation with dual-style output</p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="w-[220px]">
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        loadProject(e.target.value);
                                    } else {
                                        setActiveProject(null);
                                    }
                                }}
                                value={activeProject?._id || ''}
                                className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 outline-none focus:border-indigo-300 transition-colors font-normal cursor-pointer"
                            >
                                <option value="">Select a project...</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {activeProject && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] rounded-full border border-emerald-100 font-normal">
                                Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Creative Studio */}
            <div className="flex-1 overflow-hidden relative">
                {activeProject ? (
                    <CreativeStudio />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-[14px] font-normal text-gray-700">No Project Selected</h3>
                        <p className="text-[12px] text-gray-400 font-normal mt-1">Select a project from the dropdown above to start generating creatives</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdStudio;
