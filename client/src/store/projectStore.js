import { create } from 'zustand';
import api from '../services/api';

const useProjectStore = create((set, get) => ({
    // ── State ──────────────────────────────────────
    projects: [],
    activeProject: null,
    activeFile: null,
    fileContent: '',
    openFiles: [],
    unsavedFiles: new Set(),
    recentFiles: [],
    isLoading: false,
    generationPhase: 'idle',
    isGeneratingCreative: false,
    error: null,
    previewKey: 0,

    // Terminal / Build log state
    terminalLogs: [],

    // Orchestrator Agent state
    isRegeneratingWalkthrough: false,
    isRevalidating: false,
    isDebugging: false,

    // Ad Execution Engine state
    campaignStats: null,
    growthSuggestions: null,
    optimizationResult: null,
    isPublishing: false,
    isOptimizing: false,
    isFetchingStats: false,
    isFetchingSuggestions: false,

    // ── Terminal Logging ───────────────────────────
    addTerminalLog: (type, message) => {
        set(state => ({
            terminalLogs: [...state.terminalLogs, {
                type,
                message,
                timestamp: new Date().toISOString()
            }].slice(-200) // Keep last 200 entries
        }));
    },

    clearTerminalLogs: () => set({ terminalLogs: [] }),

    // ── Project CRUD ───────────────────────────────
    fetchProjects: async () => {
        try {
            const { data } = await api.get('/projects');
            set({ projects: data });
            return data;
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            return [];
        }
    },

    createProject: async (name, prompt, theme) => {
        set({ isLoading: true, error: null });
        const { addTerminalLog } = get();
        addTerminalLog('system', `Creating project "${name}"...`);
        try {
            const { data } = await api.post('/projects', { name, prompt, theme });
            const fullProject = await get().loadProject(data._id);
            set(state => ({
                projects: [fullProject, ...state.projects],
                isLoading: false
            }));
            addTerminalLog('success', `Project "${name}" created successfully.`);
            return fullProject;
        } catch (err) {
            set({ isLoading: false, error: err.response?.data?.message || 'Failed to create project' });
            addTerminalLog('error', `Failed to create project: ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        const { addTerminalLog } = get();
        try {
            await api.delete(`/projects/${id}`);
            const remaining = get().projects.filter(p => p._id !== id);
            const activeId = get().activeProject?._id;
            addTerminalLog('success', 'Project deleted.');
            if (activeId === id) {
                if (remaining.length > 0) {
                    await get().loadProject(remaining[0]._id);
                } else {
                    set({ activeProject: null, activeFile: null, fileContent: '', openFiles: [], unsavedFiles: new Set() });
                }
            }
            set({ projects: remaining, isLoading: false });
        } catch (err) {
            set({ isLoading: false, error: err.response?.data?.message || 'Failed to delete project' });
            addTerminalLog('error', `Delete failed: ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    loadProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/projects/${id}`);
            const files = data.fileSystem ? Object.keys(data.fileSystem) : [];
            const firstFile = files.find(f => f.endsWith('.jsx') || f.endsWith('.js')) || files[0] || null;
            set({
                activeProject: data,
                activeFile: firstFile,
                fileContent: firstFile && data.fileSystem ? data.fileSystem[firstFile] : '',
                openFiles: firstFile ? [firstFile] : [],
                unsavedFiles: new Set(),
                recentFiles: data.lastOpenedFiles || [],
                isLoading: false,
                campaignStats: null,
                growthSuggestions: null,
                optimizationResult: null
            });
            return data;
        } catch (err) {
            set({ isLoading: false, error: err.response?.data?.message || 'Failed to load project' });
            throw err;
        }
    },

    // ── AI Pipeline ────────────────────────────────
    generateBlueprint: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ generationPhase: 'blueprint', error: null });
        addTerminalLog('system', 'STAGE 1: Invoking Architect Agent (Grok)...');
        addTerminalLog('info', `Analyzing prompt: "${activeProject.prompt?.substring(0, 80)}..."`);
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/generate-blueprint`);
            addTerminalLog('success', `Blueprint generated: ${data.blueprint?.file_plan?.length || 0} files planned.`);
            set({ activeProject: data, generationPhase: 'idle' });
            return data;
        } catch (err) {
            const errProject = err.response?.data?.project;
            addTerminalLog('error', `Blueprint failed: ${err.response?.data?.message || err.message}`);
            set({
                generationPhase: 'idle',
                error: err.response?.data?.message || 'Blueprint generation failed',
                activeProject: errProject || get().activeProject
            });
            throw err;
        }
    },

    generateCode: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ generationPhase: 'codegen', error: null });
        addTerminalLog('system', 'STAGE 2: Invoking Engineer Agent (Gemini)...');
        addTerminalLog('info', 'Generating frontend files (Pass 1)...');
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/generate-code`);
            const files = data.fileSystem ? Object.keys(data.fileSystem) : [];
            const firstFile = files.find(f => f.endsWith('App.jsx')) || files.find(f => f.endsWith('.jsx')) || files[0] || null;
            addTerminalLog('success', `Build complete: ${files.length} files generated.`);
            addTerminalLog('info', `Debugger ran ${data.debugLog?.length || 0} cycle(s). Validation: ${data.validationReport?.passed ? 'PASSED' : 'ISSUES FOUND'}`);
            if (data.walkthrough) addTerminalLog('success', 'Walkthrough documentation generated.');
            set({
                activeProject: data,
                generationPhase: 'idle',
                activeFile: firstFile,
                fileContent: firstFile ? data.fileSystem[firstFile] : '',
                openFiles: firstFile ? [firstFile] : [],
                previewKey: get().previewKey + 1,
                unsavedFiles: new Set()
            });
            return data;
        } catch (err) {
            const errProject = err.response?.data?.project;
            addTerminalLog('error', `Code generation failed: ${err.response?.data?.message || err.message}`);
            set({
                generationPhase: 'idle',
                error: err.response?.data?.message || 'Code generation failed',
                activeProject: errProject || get().activeProject
            });
            throw err;
        }
    },

    // ── Chat ───────────────────────────────────────
    sendMessage: async (message) => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject || !message.trim()) return;
        const updatedProject = { ...activeProject };
        updatedProject.messages = [...(updatedProject.messages || []), { role: 'user', content: message }];
        set({ activeProject: updatedProject, generationPhase: 'codegen' });
        addTerminalLog('info', `Processing chat: "${message.substring(0, 60)}..."`);
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/chat`, { message });
            const currentFile = get().activeFile;
            addTerminalLog('success', 'Chat iteration complete. Files updated.');
            set({
                activeProject: data,
                generationPhase: 'idle',
                previewKey: get().previewKey + 1,
                fileContent: currentFile && data.fileSystem?.[currentFile] ? data.fileSystem[currentFile] : get().fileContent
            });
            return data;
        } catch (err) {
            addTerminalLog('error', `Chat failed: ${err.response?.data?.message || err.message}`);
            set({ generationPhase: 'idle', error: err.response?.data?.message || 'Chat failed' });
            throw err;
        }
    },

    // ── File Operations ────────────────────────────
    selectFile: (filePath) => {
        const { activeProject, openFiles, recentFiles } = get();
        if (!activeProject?.fileSystem) return;
        const content = activeProject.fileSystem[filePath] || '';
        const newOpenFiles = openFiles.includes(filePath) ? openFiles : [...openFiles, filePath];
        // Track recent files (max 10)
        const newRecent = [filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, 10);
        set({ activeFile: filePath, fileContent: content, openFiles: newOpenFiles, recentFiles: newRecent });
    },

    closeFile: (filePath) => {
        const { openFiles, activeFile } = get();
        const newOpenFiles = openFiles.filter(f => f !== filePath);
        const newUnsaved = new Set(get().unsavedFiles);
        newUnsaved.delete(filePath);
        if (activeFile === filePath) {
            const newActive = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
            const { activeProject } = get();
            set({
                openFiles: newOpenFiles,
                activeFile: newActive,
                fileContent: newActive && activeProject?.fileSystem ? activeProject.fileSystem[newActive] : '',
                unsavedFiles: newUnsaved
            });
        } else {
            set({ openFiles: newOpenFiles, unsavedFiles: newUnsaved });
        }
    },

    closeAllFiles: () => {
        set({ openFiles: [], activeFile: null, fileContent: '', unsavedFiles: new Set() });
    },

    updateFileContent: (content) => {
        const { activeFile, activeProject } = get();
        if (!activeFile || !activeProject) return;
        const original = activeProject.fileSystem?.[activeFile] || '';
        const newUnsaved = new Set(get().unsavedFiles);
        if (content !== original) newUnsaved.add(activeFile);
        else newUnsaved.delete(activeFile);
        set({ fileContent: content, unsavedFiles: newUnsaved });
    },

    saveCurrentFile: async () => {
        const { activeFile, fileContent, activeProject, addTerminalLog } = get();
        if (!activeFile || !activeProject) return;
        try {
            await api.put(`/projects/${activeProject._id}/files`, { filePath: activeFile, content: fileContent });
            const updatedProject = { ...activeProject };
            updatedProject.fileSystem = { ...updatedProject.fileSystem, [activeFile]: fileContent };
            const newUnsaved = new Set(get().unsavedFiles);
            newUnsaved.delete(activeFile);
            set({ activeProject: updatedProject, unsavedFiles: newUnsaved, previewKey: get().previewKey + 1 });
            addTerminalLog('info', `Saved: ${activeFile}`);
        } catch (err) {
            set({ error: 'Failed to save file' });
            addTerminalLog('error', `Save failed: ${activeFile}`);
        }
    },

    // ── File CRUD (New / Delete / Rename) ──────────
    createFile: async (filePath, content = '') => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        try {
            await api.post(`/projects/${activeProject._id}/files/create`, { filePath, content });
            const updatedProject = { ...activeProject };
            if (!updatedProject.fileSystem) updatedProject.fileSystem = {};
            updatedProject.fileSystem[filePath] = content;
            set({ activeProject: updatedProject });
            get().selectFile(filePath);
            addTerminalLog('success', `Created: ${filePath}`);
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to create file' });
            addTerminalLog('error', `Create failed: ${err.response?.data?.message || err.message}`);
        }
    },

    deleteFileAction: async (filePath) => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        try {
            await api.delete(`/projects/${activeProject._id}/files`, { data: { filePath } });
            const updatedProject = { ...activeProject };
            delete updatedProject.fileSystem[filePath];
            // Close the file if it's open
            get().closeFile(filePath);
            set({ activeProject: updatedProject, previewKey: get().previewKey + 1 });
            addTerminalLog('info', `Deleted: ${filePath}`);
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to delete file' });
            addTerminalLog('error', `Delete failed: ${err.response?.data?.message || err.message}`);
        }
    },

    renameFile: async (oldPath, newPath) => {
        const { activeProject, activeFile, addTerminalLog } = get();
        if (!activeProject) return;
        try {
            await api.patch(`/projects/${activeProject._id}/files/rename`, { oldPath, newPath });
            const updatedProject = { ...activeProject };
            updatedProject.fileSystem[newPath] = updatedProject.fileSystem[oldPath];
            delete updatedProject.fileSystem[oldPath];
            // Update open files list
            const newOpenFiles = get().openFiles.map(f => f === oldPath ? newPath : f);
            const newActiveFile = activeFile === oldPath ? newPath : activeFile;
            set({
                activeProject: updatedProject,
                openFiles: newOpenFiles,
                activeFile: newActiveFile,
                previewKey: get().previewKey + 1
            });
            addTerminalLog('info', `Renamed: ${oldPath} → ${newPath}`);
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to rename file' });
            addTerminalLog('error', `Rename failed: ${err.response?.data?.message || err.message}`);
        }
    },

    // ── Deployment ─────────────────────────────────
    deploy: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ generationPhase: 'deploying', error: null });
        addTerminalLog('system', 'STAGE 6: Deploying to production...');
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/deploy`);
            addTerminalLog('success', `Deployed! Live at: ${data.url || data.deployment?.url || 'N/A'}`);
            set({ activeProject: data.project || get().activeProject, generationPhase: 'idle' });
            return data;
        } catch (err) {
            addTerminalLog('error', `Deploy failed: ${err.response?.data?.message || err.message}`);
            set({ generationPhase: 'idle', error: err.response?.data?.message || 'Deployment failed' });
            throw err;
        }
    },

    // ── Export ──────────────────────────────────────
    exportZip: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        addTerminalLog('info', 'Exporting project as ZIP...');
        try {
            const response = await api.get(`/projects/${activeProject._id}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${activeProject.name.replace(/\s+/g, '_')}_export.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addTerminalLog('success', 'ZIP export downloaded.');
        } catch (err) {
            set({ error: 'Failed to export ZIP' });
            addTerminalLog('error', 'ZIP export failed.');
        }
    },

    // ── AI Ad Creative Studio ──────────────────────
    generateCreative: async (type, template, style, { designSettings, contentDetails, customPrompt } = {}) => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isGeneratingCreative: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/creatives/${type}`, {
                template, style,
                designSettings: designSettings || {},
                contentDetails: contentDetails || {},
                customPrompt: customPrompt || ''
            });
            set({ activeProject: data, isGeneratingCreative: false });
            return data;
        } catch (err) {
            set({ isGeneratingCreative: false, error: err.response?.data?.message || `Failed to generate ${type}` });
            throw err;
        }
    },

    updateBrandKit: async (brandKit) => {
        const { activeProject } = get();
        if (!activeProject) return;
        try {
            const { data } = await api.put(`/projects/${activeProject._id}/brandKit`, { brandKit });
            set({ activeProject: data });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update brand kit' });
            throw err;
        }
    },

    // ── Ad Execution Engine ────────────────────────
    publishAd: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isPublishing: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/publish-ad`);
            set({ activeProject: data.project, isPublishing: false });
            return data;
        } catch (err) {
            set({ isPublishing: false, error: err.response?.data?.message || 'Failed to publish ad' });
            throw err;
        }
    },

    fetchCampaignStats: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isFetchingStats: true });
        try {
            const { data } = await api.get(`/projects/${activeProject._id}/campaign-stats`);
            set({ campaignStats: data, activeProject: data.project, isFetchingStats: false });
            return data;
        } catch (err) {
            set({ isFetchingStats: false, error: err.response?.data?.message || 'Failed to fetch stats' });
            throw err;
        }
    },

    updateCampaign: async (campaignId, action, budget) => {
        const { activeProject } = get();
        if (!activeProject) return;
        try {
            const { data } = await api.patch(`/projects/${activeProject._id}/campaigns/${campaignId}`, { action, budget });
            set({ activeProject: data });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update campaign' });
            throw err;
        }
    },

    optimizeNow: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isOptimizing: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/optimize`);
            set({ optimizationResult: data, activeProject: data.project, isOptimizing: false });
            return data;
        } catch (err) {
            set({ isOptimizing: false, error: err.response?.data?.message || 'Optimization failed' });
            throw err;
        }
    },

    fetchGrowthSuggestions: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isFetchingSuggestions: true });
        try {
            const { data } = await api.get(`/projects/${activeProject._id}/growth-suggestions`);
            set({ growthSuggestions: data, isFetchingSuggestions: false });
            return data;
        } catch (err) {
            set({ isFetchingSuggestions: false, error: err.response?.data?.message || 'Failed to fetch suggestions' });
            throw err;
        }
    },

    updateAdConfig: async (adConfig) => {
        const { activeProject } = get();
        if (!activeProject) return;
        try {
            const { data } = await api.put(`/projects/${activeProject._id}/ad-config`, { adConfig });
            set({ activeProject: data });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update ad config' });
            throw err;
        }
    },

    // ── Orchestrator Agents ──────────────────────────
    fetchWalkthrough: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        try {
            const { data } = await api.get(`/projects/${activeProject._id}/walkthrough`);
            const updated = { ...activeProject, walkthrough: data.walkthrough, validationReport: data.validationReport, debugLog: data.debugLog };
            set({ activeProject: updated });
            return data;
        } catch (err) {
            console.error('Failed to fetch walkthrough:', err);
        }
    },

    regenerateWalkthrough: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ isRegeneratingWalkthrough: true, error: null });
        addTerminalLog('info', 'Regenerating walkthrough documentation...');
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/walkthrough/regenerate`);
            const updated = { ...activeProject, walkthrough: data.walkthrough };
            set({ activeProject: updated, isRegeneratingWalkthrough: false });
            addTerminalLog('success', 'Walkthrough regenerated.');
            return data;
        } catch (err) {
            set({ isRegeneratingWalkthrough: false, error: err.response?.data?.message || 'Failed to regenerate walkthrough' });
            addTerminalLog('error', `Walkthrough failed: ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    revalidate: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ isRevalidating: true, error: null });
        addTerminalLog('info', 'Running validation pipeline...');
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/validate`);
            const updated = { ...activeProject, validationReport: data.validationReport };
            set({ activeProject: updated, isRevalidating: false });
            addTerminalLog('success', `Validation: ${data.validationReport?.passed ? 'PASSED' : 'ISSUES FOUND'}`);
            return data;
        } catch (err) {
            set({ isRevalidating: false, error: err.response?.data?.message || 'Validation failed' });
            addTerminalLog('error', `Validation failed: ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    rerunDebugger: async () => {
        const { activeProject, addTerminalLog } = get();
        if (!activeProject) return;
        set({ isDebugging: true, error: null });
        addTerminalLog('system', 'Running Debugger Agent...');
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/debug`);
            const files = data.fileSystem ? Object.keys(data.fileSystem) : [];
            const firstFile = files.find(f => f.endsWith('.jsx') || f.endsWith('.js')) || files[0] || null;
            addTerminalLog('success', `Debug complete. ${data.validationReport?.passed ? 'All clear.' : 'Some issues remain.'}`);
            set({
                activeProject: data,
                isDebugging: false,
                activeFile: firstFile,
                fileContent: firstFile ? data.fileSystem[firstFile] : '',
                previewKey: get().previewKey + 1
            });
            return data;
        } catch (err) {
            set({ isDebugging: false, error: err.response?.data?.message || 'Debug failed' });
            addTerminalLog('error', `Debug failed: ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    // ── Utilities ──────────────────────────────────
    clearError: () => set({ error: null }),
    setActiveProject: (project) => set({ activeProject: project }),
    incrementPreviewKey: () => set({ previewKey: get().previewKey + 1 }),
}));

export default useProjectStore;
