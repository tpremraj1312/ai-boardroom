import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useProjectStore from '../store/projectStore';

// IDE Components
import FileExplorer from '../components/ide/FileExplorer';
import CodeEditor from '../components/ide/CodeEditor';
import ChatPanel from '../components/ide/ChatPanel';
import LivePreview from '../components/ide/LivePreview';
import BlueprintView from '../components/ide/BlueprintView';
import WalkthroughView from '../components/ide/WalkthroughView';
import StatusBar from '../components/ide/StatusBar';
import TerminalPanel from '../components/ide/TerminalPanel';
import QuickOpen from '../components/ide/QuickOpen';
import ProjectCreation from '../components/ide/ProjectCreation';

/* ── Top Toolbar ──────────────────────────────────────── */
const IDEToolbar = ({ projectName, activeTab, onTabChange, onBack, onDeleteProject, isGenerating, generationPhase, onExport, onDeploy, onValidate, fileCount, deployedUrl, unsavedCount, validationReport }) => {
    const tabs = [
        { key: 'code', label: 'Code', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> },
        { key: 'blueprint', label: 'Blueprint', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
        { key: 'preview', label: 'Preview', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> },
        { key: 'walkthrough', label: 'Walkthrough', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
    ];
    const hasErrors = validationReport && !validationReport.passed;

    return (
        <div className="h-11 bg-white border-b border-board-border flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
                <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0" title="Back to Projects">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                </button>
                <div className="h-5 w-px bg-gray-200 shrink-0"></div>
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-board-primary to-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <span className="text-sm font-medium text-board-heading truncate">{projectName || 'Untitled'}</span>
                </div>
            </div>

            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5 shrink-0">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => onTabChange(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === tab.key ? 'bg-white text-board-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{tab.icon}</svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {isGenerating && (
                    <span className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md mr-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        {generationPhase === 'codegen' ? 'Generating...' : generationPhase === 'blueprint' ? 'Planning...' : generationPhase === 'deploying' ? 'Deploying...' : 'Processing'}
                    </span>
                )}
                {unsavedCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{unsavedCount} unsaved
                    </span>
                )}
                {validationReport && (
                    <button onClick={onValidate} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${hasErrors ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`} title="Re-validate">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {hasErrors ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        </svg>
                        {hasErrors ? 'Issues' : 'Passed'}
                    </button>
                )}
                {deployedUrl && (
                    <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors" title="Open deployed site">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                        Live
                    </a>
                )}
                <div className="h-5 w-px bg-gray-200"></div>
                <button onClick={onExport} disabled={!fileCount} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Download ZIP">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Export
                </button>
                <button onClick={onDeploy} disabled={generationPhase !== 'idle' || !fileCount} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-board-primary text-white hover:bg-board-primaryHover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm" title="Deploy to production">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                    Deploy
                </button>
                <div className="h-5 w-px bg-gray-200"></div>
                <button onClick={onDeleteProject} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete Project">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

/* ── Project History Sidebar (before project is selected) ─ */
const ProjectHistorySidebar = ({ projects, onSelectProject, onCreateNew, isLoading }) => (
    <div className="w-64 h-full bg-white border-r border-board-border flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b border-board-border shrink-0">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-board-primary to-indigo-600 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div>
                    <h2 className="text-sm font-medium text-board-heading leading-none">Full-Stack IDE</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-normal">AI-powered builder</p>
                </div>
            </div>
            <button onClick={onCreateNew} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-board-primary text-white rounded-lg text-[12px] font-medium hover:bg-board-primaryHover transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                New Project
            </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
            <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 px-1">Recent Projects</h3>
            {projects.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-[11px] text-gray-400 font-normal">No projects yet</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {projects.map((project) => (
                        <button key={project._id} onClick={() => onSelectProject(project._id)} disabled={isLoading}
                            className="w-full text-left p-2.5 rounded-lg transition-all group flex items-center gap-2.5 hover:bg-gray-50 border border-transparent">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 group-hover:bg-gray-100">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-medium truncate text-board-heading">{project.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`text-[9px] px-1.5 py-px rounded-full font-medium ${project.status === 'ready' ? 'bg-green-50 text-green-600' : project.status === 'deployed' ? 'bg-purple-50 text-purple-600' : project.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>{project.status || 'idle'}</span>
                                    <span className="text-[9px] text-gray-300 font-normal">v{project.version || 1}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN IDE COMPONENT
   ══════════════════════════════════════════════════════════ */
const FullStackGenerator = () => {
    const navigate = useNavigate();
    const {
        projects, activeProject, activeFile, fileContent, openFiles, unsavedFiles, recentFiles,
        isLoading, generationPhase, error, previewKey, terminalLogs,
        fetchProjects, createProject, deleteProject, loadProject,
        generateBlueprint, generateCode, sendMessage,
        selectFile, closeFile, closeAllFiles, updateFileContent, saveCurrentFile,
        createFile, deleteFileAction, renameFile,
        deploy, exportZip, revalidate, clearError, addTerminalLog,
    } = useProjectStore();

    const [activeTab, setActiveTab] = useState('code');
    const [showTerminal, setShowTerminal] = useState(true);
    const [quickOpenVisible, setQuickOpenVisible] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setQuickOpenVisible(v => !v); }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); setShowTerminal(v => !v); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [saveCurrentFile]);

    const handleCreateProject = useCallback(async (name, prompt, theme) => {
        await createProject(name, prompt, theme);
        setShowCreateForm(false);
    }, [createProject]);

    const handleDeleteProject = useCallback(async () => {
        if (!activeProject) return;
        if (!window.confirm(`Delete "${activeProject.name}"? This cannot be undone.`)) return;
        await deleteProject(activeProject._id);
    }, [activeProject, deleteProject]);

    const handleSelectProject = useCallback(async (projectId) => {
        setShowCreateForm(false);
        await loadProject(projectId);
    }, [loadProject]);

    const handleBack = useCallback(() => {
        useProjectStore.setState({ activeProject: null, activeFile: null, fileContent: '', openFiles: [], unsavedFiles: new Set() });
        setShowCreateForm(false);
    }, []);

    const handleQuickOpenSelect = useCallback((filePath) => {
        selectFile(filePath);
        setActiveTab('code');
    }, [selectFile]);

    const fileSystem = activeProject?.fileSystem || {};
    const fileCount = Object.keys(fileSystem).length;
    const messages = activeProject?.messages || [];
    const isGenerating = generationPhase !== 'idle';

    // ══════════════════════════════════════════════════
    // RENDER: No project selected
    // ══════════════════════════════════════════════════
    if (!activeProject) {
        return (
            <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-board-bg">
                <ProjectHistorySidebar projects={projects} onSelectProject={handleSelectProject} onCreateNew={() => setShowCreateForm(true)} isLoading={isLoading} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {showCreateForm ? (
                        <div className="flex-1 flex items-center justify-center p-6 bg-board-bgSecondary overflow-auto">
                            <div className="w-full max-w-lg">
                                <ProjectCreation onCreateProject={handleCreateProject} isLoading={isLoading} showCancel={true} onCancel={() => setShowCreateForm(false)} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-board-bgSecondary">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-board-primary to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-board-primary/20">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-board-heading">Welcome to Full-Stack IDE</h2>
                                    <p className="text-sm text-gray-400 mt-1 font-normal">Select a project or create a new one</p>
                                </div>
                                <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-board-primary text-white rounded-xl text-sm font-medium hover:bg-board-primaryHover transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Create New Project
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════
    // RENDER: Project selected → IDE workspace
    // Uses plain CSS flex layout (NO resizable panels)
    // to guarantee chat + file explorer visibility
    // ══════════════════════════════════════════════════
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-board-bg">
            {/* ── Toolbar ────────────────────────────────── */}
            <IDEToolbar
                projectName={activeProject?.name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleBack}
                onDeleteProject={handleDeleteProject}
                isGenerating={isGenerating}
                generationPhase={generationPhase}
                onExport={exportZip}
                onDeploy={deploy}
                onValidate={revalidate}
                fileCount={fileCount}
                deployedUrl={activeProject?.deployedUrl}
                unsavedCount={unsavedFiles?.size || 0}
                validationReport={activeProject?.validationReport}
            />

            {/* ── Main content: Chat | FileExplorer | Editor ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">

                {/* ── LEFT: Chat Sidebar (fixed 280px) ──────── */}
                <div className="w-[280px] shrink-0 border-r border-board-border overflow-hidden">
                    <ChatPanel
                        messages={messages}
                        onSendMessage={sendMessage}
                        isGenerating={isGenerating}
                        generationPhase={generationPhase}
                        activeFile={activeFile}
                        projectName={activeProject?.name}
                    />
                </div>

                {/* ── CENTER: Workspace area ─────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="flex-1 flex min-h-0 overflow-hidden">

                        {/* CODE TAB */}
                        <div className={activeTab === 'code' ? "flex-1 flex min-w-0 overflow-hidden" : "hidden"}>
                            {/* File Explorer (fixed 220px) */}
                            <div className="w-[220px] shrink-0 border-r border-board-border overflow-hidden">
                                <FileExplorer
                                    fileSystem={fileSystem}
                                    activeFile={activeFile}
                                    onSelectFile={selectFile}
                                    onCreateFile={createFile}
                                    onDeleteFile={deleteFileAction}
                                    onRenameFile={renameFile}
                                />
                            </div>

                            {/* Code Editor + Terminal */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                {/* Editor */}
                                <div className={`${showTerminal ? 'flex-[7]' : 'flex-1'} min-h-0 overflow-hidden`}>
                                    <CodeEditor
                                        activeFile={activeFile}
                                        fileContent={fileContent}
                                        openFiles={openFiles}
                                        unsavedFiles={unsavedFiles}
                                        onSelectFile={selectFile}
                                        onCloseFile={closeFile}
                                        onCloseAllFiles={closeAllFiles}
                                        onContentChange={updateFileContent}
                                        onSave={saveCurrentFile}
                                    />
                                </div>
                                {/* Terminal */}
                                {showTerminal && (
                                    <div className="flex-[3] min-h-[120px] border-t border-board-border overflow-hidden">
                                        <TerminalPanel
                                            logs={terminalLogs}
                                            isGenerating={isGenerating}
                                            generationPhase={generationPhase}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BLUEPRINT TAB */}
                        <div className={activeTab === 'blueprint' ? "flex-1 min-w-0 overflow-hidden" : "hidden"}>
                            <BlueprintView
                                blueprint={activeProject?.blueprint}
                                isGenerating={generationPhase === 'blueprint'}
                                onGenerateBlueprint={generateBlueprint}
                                onGenerateCode={generateCode}
                                hasCode={fileCount > 0}
                            />
                        </div>

                        {/* PREVIEW TAB */}
                        {/* We use CSS absolute hiding instead of 'display: none' so Sandpack iframe shell connection doesn't get destroyed by the browser */}
                        <div className={activeTab === 'preview' ? "flex-1 min-w-0 overflow-hidden relative" : "absolute w-0 h-0 opacity-0 pointer-events-none overflow-hidden -z-10"}>
                            <LivePreview fileSystem={fileSystem} previewKey={previewKey} />
                        </div>

                        {/* WALKTHROUGH TAB */}
                        <div className={activeTab === 'walkthrough' ? "flex-1 min-w-0 overflow-hidden" : "hidden"}>
                            <WalkthroughView
                                walkthrough={activeProject?.walkthrough}
                                validationReport={activeProject?.validationReport}
                                debugLog={activeProject?.debugLog}
                                projectName={activeProject?.name}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Status Bar ─────────────────────────────── */}
            <StatusBar
                status={activeProject?.status}
                generationPhase={generationPhase}
                activeFile={activeFile}
                fileCount={fileCount}
                version={activeProject?.version}
                validationReport={activeProject?.validationReport}
                deployedUrl={activeProject?.deployedUrl}
                unsavedCount={unsavedFiles?.size || 0}
                onExport={exportZip}
                onDeploy={deploy}
                onValidate={revalidate}
            />

            {/* ── Terminal Toggle ─────────────────────────── */}
            {activeTab === 'code' && (
                <button onClick={() => setShowTerminal(v => !v)}
                    className={`fixed bottom-8 right-6 z-30 p-2 rounded-lg shadow-md border transition-all ${showTerminal ? 'bg-board-primary text-white border-board-primary/50 hover:bg-board-primaryHover' : 'bg-white text-gray-500 border-gray-200 hover:text-board-primary hover:border-board-primary/30'}`}
                    title={`${showTerminal ? 'Hide' : 'Show'} Terminal`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
            )}

            {/* ── Quick Open ──────────────────────────────── */}
            <QuickOpen isOpen={quickOpenVisible} onClose={() => setQuickOpenVisible(false)} fileSystem={fileSystem} recentFiles={recentFiles} onSelectFile={handleQuickOpenSelect} />

            {/* ── Error Toast ─────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-10 right-4 max-w-sm bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg z-40">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-red-800 font-medium">Error</p>
                                <p className="text-xs text-red-600 mt-0.5 font-normal">{error}</p>
                            </div>
                            <button onClick={clearError} className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FullStackGenerator;
