import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProjectStore from '../store/projectStore';
import FileExplorer from '../components/ide/FileExplorer';
import CodeEditorPanel from '../components/ide/CodeEditor';
import LivePreview from '../components/ide/LivePreview';
import ChatPanel from '../components/ide/ChatPanel';
import BlueprintView from '../components/ide/BlueprintView';
import ProjectCreation from '../components/ide/ProjectCreation';
import StatusBar from '../components/ide/StatusBar';

const FullStackGenerator = () => {
    const {
        projects, activeProject, activeFile, fileContent, openFiles, unsavedFiles,
        isLoading, generationPhase, error, previewKey,
        fetchProjects, createProject, loadProject, generateBlueprint, generateCode,
        sendMessage, selectFile, closeFile, updateFileContent, saveCurrentFile,
        deploy, exportZip, clearError
    } = useProjectStore();

    const [showCreation, setShowCreation] = useState(false);
    const [mainTab, setMainTab] = useState('preview'); // code | preview | blueprint

    useEffect(() => {
        fetchProjects().then(data => {
            if (data && data.length > 0) loadProject(data[0]._id);
            else setShowCreation(true);
        });
    }, []);

    // Auto-switch main tab based on project state
    useEffect(() => {
        if (activeProject) {
            const hasFiles = activeProject.fileSystem && Object.keys(activeProject.fileSystem).length > 0;
            const hasBlueprint = !!activeProject.blueprint;
            if (hasFiles) setMainTab('preview'); // preview first after files exist
            else if (hasBlueprint) setMainTab('blueprint');
        }
    }, [activeProject?.blueprint, activeProject?.fileSystem]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveCurrentFile();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [saveCurrentFile]);

    const handleCreateProject = useCallback(async (name, prompt, theme) => {
        await createProject(name, prompt, theme);
        setShowCreation(false);
    }, [createProject]);

    const handleGenerateBlueprint = useCallback(async () => {
        try {
            await generateBlueprint();
            setMainTab('blueprint');
        } catch (err) { /* handled by store */ }
    }, [generateBlueprint]);

    const handleGenerateCode = useCallback(async () => {
        try {
            await generateCode();
            setMainTab('code');
        } catch (err) { /* handled by store */ }
    }, [generateCode]);

    const handleSendMessage = useCallback(async (msg) => {
        try {
            await sendMessage(msg);
            setMainTab('preview'); // Usually want to see preview after chat changes code
        } catch (err) { /* handled by store */ }
    }, [sendMessage]);

    const handleDeploy = useCallback(async () => {
        try {
            await deploy();
        } catch (err) {
            // Error handled by store
        }
    }, [deploy]);

    // ── Show creation form if no project ──
    if (showCreation || (!activeProject && !isLoading)) {
        return (
            <div className="h-[calc(100vh-theme(spacing.16))]">
                <ProjectCreation
                    onCreateProject={handleCreateProject}
                    isLoading={isLoading}
                    onCancel={() => setShowCreation(false)}
                    showCancel={projects.length > 0}
                />
            </div>
        );
    }

    const hasFiles = activeProject?.fileSystem && Object.keys(activeProject.fileSystem).length > 0;
    const hasBlueprint = !!activeProject?.blueprint;
    const isGenerating = generationPhase !== 'idle';

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] bg-white overflow-hidden text-board-textMain font-normal">
            
            {/* ── LEFT PANEL: CHAT ────────────────────────────── */}
            <div className="w-[340px] flex-shrink-0 h-full border-r border-gray-100 flex flex-col bg-gray-50/50">
                {/* Project Selector Header */}
                <div className="h-12 border-b border-gray-100 flex items-center px-4 shrink-0 bg-white">
                    <div className="w-6 h-6 rounded-lg bg-board-primary/8 flex items-center justify-center mr-2">
                        <svg className="w-3.5 h-3.5 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <select
                        onChange={(e) => {
                            if (e.target.value === '__new__') setShowCreation(true);
                            else loadProject(e.target.value);
                        }}
                        value={activeProject?._id || ''}
                        className="flex-1 text-[13px] bg-transparent border-none focus:outline-none cursor-pointer pr-4 appearance-none truncate"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                        <option value="__new__">+ New Project</option>
                    </select>
                </div>

                {/* Chat Body */}
                <div className="flex-1 overflow-hidden">
                    <ChatPanel
                        messages={activeProject?.messages}
                        isGenerating={isGenerating}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>

            {/* ── MAIN WORKSPACE ────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                
                {/* Top Toolbar */}
                <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0 bg-white z-10">
                    
                    {/* View Tabs */}
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        {hasBlueprint && (
                            <button
                                onClick={() => setMainTab('blueprint')}
                                className={`px-3 py-1 rounded-md text-[12px] transition-all flex items-center gap-1.5 ${
                                    mainTab === 'blueprint'
                                        ? 'bg-white text-board-textMain shadow-sm border border-gray-200/50 text-board-primary'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                Blueprint
                            </button>
                        )}
                        <button
                            onClick={() => setMainTab('code')}
                            className={`px-3 py-1 rounded-md text-[12px] transition-all flex items-center gap-1.5 ${
                                mainTab === 'code'
                                    ? 'bg-white text-board-textMain shadow-sm border border-gray-200/50 text-board-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Code
                        </button>
                        <button
                            onClick={() => setMainTab('preview')}
                            className={`px-3 py-1 rounded-md text-[12px] transition-all flex items-center gap-1.5 ${
                                mainTab === 'preview'
                                    ? 'bg-white text-board-textMain shadow-sm border border-gray-200/50 text-board-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </button>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2">
                        {/* Generate Blueprint Base */}
                        {!hasBlueprint && !hasFiles && (
                            <button
                                onClick={handleGenerateBlueprint}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-board-primary/8 text-board-primary rounded-lg text-[12px] hover:bg-board-primary/15 disabled:opacity-50 transition-all font-normal"
                            >
                                {generationPhase === 'blueprint' ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                )}
                                {generationPhase === 'blueprint' ? 'Generating...' : 'Start Planning'}
                            </button>
                        )}

                        {/* Generate Code Action */}
                        {hasBlueprint && !hasFiles && (
                            <button
                                onClick={handleGenerateCode}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-board-primary text-white rounded-lg text-[12px] hover:bg-board-primaryHover disabled:opacity-50 transition-all font-normal"
                            >
                                {generationPhase === 'codegen' ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                )}
                                {generationPhase === 'codegen' ? 'Building...' : 'Build App'}
                            </button>
                        )}

                        {/* Save Action */}
                        {unsavedFiles.size > 0 && mainTab === 'code' && (
                            <button
                                onClick={saveCurrentFile}
                                className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-board-primary bg-board-primary/8 rounded-lg hover:bg-board-primary/15 transition-all font-normal"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                Save
                            </button>
                        )}

                        {/* Export Action */}
                        {hasFiles && (
                            <button
                                onClick={exportZip}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all font-normal"
                                title="Download complete source code"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export Zip
                            </button>
                        )}

                        {/* Deploy Action */}
                        {hasFiles && (
                            <button
                                onClick={handleDeploy}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-board-primary text-white rounded-lg text-[12px] hover:bg-board-primaryHover disabled:opacity-50 transition-all font-normal"
                            >
                                {generationPhase === 'deploying' ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                )}
                                {generationPhase === 'deploying' ? 'Deploying...' : 'Deploy'}
                            </button>
                        )}

                        {/* Live URL */}
                        {activeProject?.deployedUrl && (
                            <a
                                href={activeProject.deployedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-green-600 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-all font-normal ml-1"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Live App
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="absolute top-12 left-0 right-0 z-20 bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between"
                        >
                            <span className="text-xs text-red-600 font-normal">{error}</span>
                            <button onClick={clearError} className="text-red-400 hover:text-red-600 p-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative bg-[#F8F9FA]">
                    {mainTab === 'blueprint' && hasBlueprint ? (
                        <BlueprintView
                            blueprint={activeProject.blueprint}
                            onGenerateCode={handleGenerateCode}
                            isGenerating={generationPhase === 'codegen'}
                        />
                    ) : mainTab === 'code' && hasFiles ? (
                        <div className="flex h-full w-full bg-white">
                            {/* Inner Left: File Explorer */}
                            <div className="w-[260px] border-r border-gray-100 flex-shrink-0 flex flex-col bg-gray-50/30">
                                <FileExplorer
                                    fileSystem={activeProject?.fileSystem}
                                    activeFile={activeFile}
                                    onSelectFile={selectFile}
                                />
                            </div>
                            {/* Inner Right: Editor */}
                            <div className="flex-1 flex flex-col min-w-0">
                                <CodeEditorPanel
                                    activeFile={activeFile}
                                    fileContent={fileContent}
                                    openFiles={openFiles}
                                    unsavedFiles={unsavedFiles}
                                    onContentChange={updateFileContent}
                                    onSelectFile={selectFile}
                                    onCloseFile={closeFile}
                                />
                            </div>
                        </div>
                    ) : mainTab === 'preview' && hasFiles ? (
                        <div className="h-full w-full bg-white overflow-hidden">
                            <LivePreview
                                fileSystem={activeProject?.fileSystem}
                                previewKey={previewKey}
                            />
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                            <div className="text-center max-w-sm">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-board-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-normal text-board-heading mb-1">Project is empty</h3>
                                <p className="text-[13px] text-gray-500 font-normal">
                                    {hasBlueprint
                                        ? 'Blueprint is ready. Click "Build App" to generate the code.'
                                        : 'Use the chat assistant on the left to start planning your app.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <StatusBar
                    activeFile={activeFile}
                    fileSystem={activeProject?.fileSystem}
                    version={activeProject?.version || 1}
                    generationPhase={generationPhase}
                    deployedUrl={activeProject?.deployedUrl}
                />
            </div>
        </div>
    );
};

export default FullStackGenerator;
