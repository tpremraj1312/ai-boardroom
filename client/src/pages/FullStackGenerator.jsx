import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const FullStackGenerator = () => {
    // Top Level State
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [newProjName, setNewProjName] = useState('');
    const [newProjPrompt, setNewProjPrompt] = useState('');

    // IDE State
    const [activeFile, setActiveFile] = useState(null);
    const [fileContentLocal, setFileContentLocal] = useState(''); // for local manual edits
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
            if (data.length > 0 && !activeProject) {
                loadProjectData(data[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadProjectData = async (id) => {
        try {
            const { data } = await api.get(`/projects/${id}`);
            setActiveProject(data);

            // Auto-select package.json or README
            if (data.fileSystem) {
                if (data.fileSystem['README.md']) setActiveFile('README.md');
                else if (data.fileSystem['package.json']) setActiveFile('package.json');
                else setActiveFile(Object.keys(data.fileSystem)[0] || null);
            }
            if (activeFile && data.fileSystem[activeFile]) {
                setFileContentLocal(data.fileSystem[activeFile]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            setIsGenerating(true);
            const { data } = await api.post('/projects', { name: newProjName, prompt: newProjPrompt });
            setActiveProject(data);
            setIsCreating(false);
            setNewProjName('');
            setNewProjPrompt('');
            setActiveFile('README.md');
            setFileContentLocal(data.fileSystem['README.md']);
            fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize project');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeProject) return;

        const messageText = chatInput;
        setChatInput('');

        // Optimistic UI update for chat history
        const optimisticProject = { ...activeProject };
        optimisticProject.messages.push({ role: 'user', content: messageText });
        setActiveProject(optimisticProject);

        try {
            setIsGenerating(true);
            const { data } = await api.post(`/projects/${activeProject._id}/chat`, { message: messageText });
            setActiveProject(data); // Sync new VFS and messages
            if (activeFile && data.fileSystem[activeFile]) {
                setFileContentLocal(data.fileSystem[activeFile]); // Refresh editor if currently open file was modified
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to process chat');
        } finally {
            setIsGenerating(false);
            scrollToBottom();
        }
    };

    const handleExportZip = async () => {
        try {
            const response = await api.get(`/projects/${activeProject._id}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${activeProject.name.replace(/\s+/g, '_')}_export.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to export Zip");
        }
    };

    const selectFile = (path) => {
        setActiveFile(path);
        setFileContentLocal(activeProject.fileSystem[path]);
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeProject?.messages]);

    // Format file tree nicely
    const renderFileTree = () => {
        if (!activeProject || !activeProject.fileSystem) return null;

        const filePaths = Object.keys(activeProject.fileSystem).sort();

        return filePaths.map(path => {
            const isSelected = activeFile === path;
            const parts = path.split('/');
            const indent = (parts.length - 1) * 12;
            const fileName = parts[parts.length - 1];

            return (
                <div
                    key={path}
                    onClick={() => selectFile(path)}
                    style={{ paddingLeft: `${indent + 12}px` }}
                    className={`py-1.5 px-3 flex items-center text-[13px] cursor-pointer font-medium transition-colors ${isSelected ? 'bg-board-primary/10 text-board-primary border-r-2 border-board-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                    <svg className="w-3.5 h-3.5 mr-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {fileName}
                </div>
            );
        });
    };

    if (isCreating || (!activeProject && !isGenerating)) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))] bg-gray-50/50">
                <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-board-primary/10 rounded-full blur-2xl -z-10"></div>
                    <h2 className="text-2xl font-medium text-board-heading mb-2 text-center tracking-tight">Project Genesis</h2>
                    <p className="text-gray-500 text-sm text-center mb-8">Initialize a new Full-Stack Workspace</p>

                    <form onSubmit={handleCreateProject} className="space-y-5">
                        <Input
                            label="Project Name"
                            value={newProjName}
                            onChange={(e) => setNewProjName(e.target.value)}
                            placeholder="e.g. Acme Backend"
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-board-textMain mb-2">Build Prompt</label>
                            <textarea
                                required
                                value={newProjPrompt}
                                onChange={(e) => setNewProjPrompt(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 p-3 min-h-[100px] bg-gray-50/50 focus:ring-board-primary text-sm"
                                placeholder="Describe the full stack app you want to build..."
                            ></textarea>
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        <div className="flex gap-3">
                            {projects.length > 0 && (
                                <Button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5">
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" variant="primary" isLoading={isGenerating} className="flex-1 py-2.5 font-medium">
                                Bootstrap Setup
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gray-100 overflow-hidden">
            {/* TOP BAR */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full relative">
                <div className="flex items-center gap-4">
                    <div className="bg-board-primary/10 text-board-primary w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-medium text-gray-900 text-sm">{activeProject?.name || 'Loading...'}</span>
                        <span className="ml-2 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium border border-gray-200">v{activeProject?.version || 1}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        onChange={(e) => {
                            if (e.target.value === 'NEW') setIsCreating(true);
                            else loadProjectData(e.target.value);
                        }}
                        value={activeProject?._id || ''}
                        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-medium focus:outline-none"
                    >
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        <option value="NEW">+ New Project</option>
                    </select>

                    <Button onClick={handleExportZip} className="bg-board-primary text-white text-sm py-1.5 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export ZIP
                    </Button>
                </div>
            </div>

            {/* IDE WORKSPACE */}
            <div className="flex-1 flex overflow-hidden w-full relative">
                {/* 1. LEFT PANE - FILE EXPLORER */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shrink-0">
                    <div className="uppercase tracking-widest text-[10px] font-medium text-gray-400 p-4 border-b border-gray-100">
                        Virtual File System
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {renderFileTree()}
                    </div>
                </div>

                {/* 2. CENTER PANE - CODE EDITOR */}
                <div className="flex-1 bg-[#1e1e1e] flex flex-col relative min-w-0">
                    <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4 shrink-0">
                        <span className="text-[#9cdcfe] text-sm font-medium font-mono">{activeFile || 'No file selected'}</span>
                    </div>

                    {/* Read-only view for MVP. We let AI drive the primary modifications. */}
                    <div className="flex-1 overflow-auto p-4 relative">
                        {isGenerating && (
                            <div className="absolute top-4 right-4 bg-board-primary/20 text-board-primary px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                                <Spinner className="w-3 h-3 mr-2" /> AI Analyzing File System...
                            </div>
                        )}
                        <pre className="font-mono text-[13px] leading-relaxed text-[#d4d4d4] font-medium min-w-full">
                            <code>{fileContentLocal}</code>
                        </pre>
                    </div>
                </div>

                {/* 3. RIGHT PANE - CHAT INTERFACE */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 z-10 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <div className="h-12 border-b border-gray-100 flex items-center px-4 shadow-sm shrink-0">
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-board-primary animate-pulse"></span>
                            AI Architect Chat
                        </span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30">
                        {activeProject?.messages?.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-2xl text-[13.5px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-board-primary text-white rounded-br-sm shadow-md' : 'bg-white border text-gray-800 rounded-bl-sm shadow-sm'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium select-none">
                                    {msg.role === 'user' ? 'You' : 'Architect'}
                                </span>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex items-start">
                                <div className="p-3 bg-white border rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <form onSubmit={handleChatSubmit} className="relative">
                            <textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="E.g. Add a login route in server/index.js..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-board-primary/20 resize-none h-24 font-medium placeholder:font-medium placeholder:text-gray-400 shadow-inner"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleChatSubmit(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isGenerating}
                                className="absolute bottom-3 right-3 p-2 bg-board-primary text-white rounded-lg hover:bg-board-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullStackGenerator;
