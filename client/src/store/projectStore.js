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
    isLoading: false,
    generationPhase: 'idle',
    isGeneratingCreative: false,
    error: null,
    previewKey: 0,

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
        try {
            const { data } = await api.post('/projects', { name, prompt, theme });
            const fullProject = await get().loadProject(data._id);
            set(state => ({
                projects: [fullProject, ...state.projects],
                isLoading: false
            }));
            return fullProject;
        } catch (err) {
            set({ isLoading: false, error: err.response?.data?.message || 'Failed to create project' });
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
        const { activeProject } = get();
        if (!activeProject) return;
        set({ generationPhase: 'blueprint', error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/generate-blueprint`);
            set({ activeProject: data, generationPhase: 'idle' });
            return data;
        } catch (err) {
            const errProject = err.response?.data?.project;
            set({
                generationPhase: 'idle',
                error: err.response?.data?.message || 'Blueprint generation failed',
                activeProject: errProject || get().activeProject
            });
            throw err;
        }
    },

    generateCode: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ generationPhase: 'codegen', error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/generate-code`);
            const files = data.fileSystem ? Object.keys(data.fileSystem) : [];
            const firstFile = files.find(f => f.endsWith('App.jsx')) || files.find(f => f.endsWith('.jsx')) || files[0] || null;
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
        const { activeProject } = get();
        if (!activeProject || !message.trim()) return;
        const updatedProject = { ...activeProject };
        updatedProject.messages = [...(updatedProject.messages || []), { role: 'user', content: message }];
        set({ activeProject: updatedProject, generationPhase: 'codegen' });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/chat`, { message });
            const currentFile = get().activeFile;
            set({
                activeProject: data,
                generationPhase: 'idle',
                previewKey: get().previewKey + 1,
                fileContent: currentFile && data.fileSystem?.[currentFile] ? data.fileSystem[currentFile] : get().fileContent
            });
            return data;
        } catch (err) {
            set({ generationPhase: 'idle', error: err.response?.data?.message || 'Chat failed' });
            throw err;
        }
    },

    // ── File Operations ────────────────────────────
    selectFile: (filePath) => {
        const { activeProject, openFiles } = get();
        if (!activeProject?.fileSystem) return;
        const content = activeProject.fileSystem[filePath] || '';
        const newOpenFiles = openFiles.includes(filePath) ? openFiles : [...openFiles, filePath];
        set({ activeFile: filePath, fileContent: content, openFiles: newOpenFiles });
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
        const { activeFile, fileContent, activeProject } = get();
        if (!activeFile || !activeProject) return;
        try {
            await api.put(`/projects/${activeProject._id}/files`, { filePath: activeFile, content: fileContent });
            const updatedProject = { ...activeProject };
            updatedProject.fileSystem = { ...updatedProject.fileSystem, [activeFile]: fileContent };
            const newUnsaved = new Set(get().unsavedFiles);
            newUnsaved.delete(activeFile);
            set({ activeProject: updatedProject, unsavedFiles: newUnsaved, previewKey: get().previewKey + 1 });
        } catch (err) {
            set({ error: 'Failed to save file' });
        }
    },

    // ── Deployment ─────────────────────────────────
    deploy: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ generationPhase: 'deploying', error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/deploy`);
            set({ activeProject: data.project || get().activeProject, generationPhase: 'idle' });
            return data;
        } catch (err) {
            set({ generationPhase: 'idle', error: err.response?.data?.message || 'Deployment failed' });
            throw err;
        }
    },

    // ── Export ──────────────────────────────────────
    exportZip: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
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
        } catch (err) {
            set({ error: 'Failed to export ZIP' });
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
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isRegeneratingWalkthrough: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/walkthrough/regenerate`);
            const updated = { ...activeProject, walkthrough: data.walkthrough };
            set({ activeProject: updated, isRegeneratingWalkthrough: false });
            return data;
        } catch (err) {
            set({ isRegeneratingWalkthrough: false, error: err.response?.data?.message || 'Failed to regenerate walkthrough' });
            throw err;
        }
    },

    revalidate: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isRevalidating: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/validate`);
            const updated = { ...activeProject, validationReport: data.validationReport };
            set({ activeProject: updated, isRevalidating: false });
            return data;
        } catch (err) {
            set({ isRevalidating: false, error: err.response?.data?.message || 'Validation failed' });
            throw err;
        }
    },

    rerunDebugger: async () => {
        const { activeProject } = get();
        if (!activeProject) return;
        set({ isDebugging: true, error: null });
        try {
            const { data } = await api.post(`/projects/${activeProject._id}/debug`);
            const files = data.fileSystem ? Object.keys(data.fileSystem) : [];
            const firstFile = files.find(f => f.endsWith('.jsx') || f.endsWith('.js')) || files[0] || null;
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
            throw err;
        }
    },

    // ── Utilities ──────────────────────────────────
    clearError: () => set({ error: null }),
    setActiveProject: (project) => set({ activeProject: project }),
    incrementPreviewKey: () => set({ previewKey: get().previewKey + 1 }),
}));

export default useProjectStore;
