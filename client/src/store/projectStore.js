import { create } from 'zustand';
import api from '../services/api';

const useProjectStore = create((set, get) => ({
    // ── State ──────────────────────────────────────
    projects: [],
    activeProject: null,
    activeFile: null,
    fileContent: '',
    openFiles: [], // tab bar
    unsavedFiles: new Set(),
    isLoading: false,
    generationPhase: 'idle', // idle | blueprint | codegen | deploying
    isGeneratingCreative: false,
    error: null,
    previewKey: 0,

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
            
            // Automatically hydrate the active project via loadProject to sync the pre-seeded files instantly
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
                isLoading: false
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

        // Optimistic user message
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
        if (content !== original) {
            newUnsaved.add(activeFile);
        } else {
            newUnsaved.delete(activeFile);
        }
        set({ fileContent: content, unsavedFiles: newUnsaved });
    },

    saveCurrentFile: async () => {
        const { activeFile, fileContent, activeProject } = get();
        if (!activeFile || !activeProject) return;

        try {
            await api.put(`/projects/${activeProject._id}/files`, {
                filePath: activeFile,
                content: fileContent
            });

            const updatedProject = { ...activeProject };
            updatedProject.fileSystem = { ...updatedProject.fileSystem, [activeFile]: fileContent };
            const newUnsaved = new Set(get().unsavedFiles);
            newUnsaved.delete(activeFile);
            set({
                activeProject: updatedProject,
                unsavedFiles: newUnsaved,
                previewKey: get().previewKey + 1
            });
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
            set({
                activeProject: data.project || get().activeProject,
                generationPhase: 'idle'
            });
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
                template,
                style,
                designSettings: designSettings || {},
                contentDetails: contentDetails || {},
                customPrompt: customPrompt || ''
            });
            
            // Backend returns updated activeProject
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

    // ── Utilities ──────────────────────────────────
    clearError: () => set({ error: null }),
    setActiveProject: (project) => set({ activeProject: project }),
    incrementPreviewKey: () => set({ previewKey: get().previewKey + 1 }),
}));

export default useProjectStore;
