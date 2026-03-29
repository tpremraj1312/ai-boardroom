import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
    { id: 'modern', label: 'Modern', color: '#2563EB', preview: 'bg-blue-500' },
    { id: 'emerald', label: 'Emerald', color: '#10B981', preview: 'bg-emerald-500' },
    { id: 'sunset', label: 'Sunset', color: '#F59E0B', preview: 'bg-amber-500' },
    { id: 'rose', label: 'Rose', color: '#F43F5E', preview: 'bg-rose-500' },
    { id: 'violet', label: 'Violet', color: '#8B5CF6', preview: 'bg-violet-500' },
    { id: 'slate', label: 'Minimal', color: '#475569', preview: 'bg-slate-500' },
];

const examplePrompts = [
    'Build a task manager with user authentication and project boards',
    'Create an e-commerce store with product catalog and shopping cart',
    'Build a blog platform with markdown editor and comments',
    'Create a real-time chat application with rooms and notifications',
];

const ProjectCreation = ({ onCreateProject, isLoading, onCancel, showCancel }) => {
    const [name, setName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [theme, setTheme] = useState('modern');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !prompt.trim()) {
            setError('Both name and description are required');
            return;
        }
        setError('');
        try {
            await onCreateProject(name.trim(), prompt.trim(), theme);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        }
    };

    return (
        <div className="flex items-center justify-center h-full bg-gray-50/50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-lg"
            >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-board-primary/8 flex items-center justify-center">
                                <svg className="w-5 h-5 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base text-board-heading font-normal">New Project</h2>
                                <p className="text-xs text-gray-400 font-normal">Describe your app and AI will build it</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 font-normal">Project name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. TaskFlow Pro"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-board-textMain placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-primary/30 focus:border-board-primary/30 transition-all font-normal"
                                required
                            />
                        </div>

                        {/* Prompt */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 font-normal">What do you want to build?</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your full-stack application in detail..."
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-board-textMain placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-primary/30 focus:border-board-primary/30 transition-all resize-none font-normal"
                                rows={3}
                                required
                            />
                            {/* Example Chips */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {examplePrompts.map((ex, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setPrompt(ex)}
                                        className="text-[11px] px-2 py-1 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors font-normal"
                                    >
                                        {ex.substring(0, 40)}...
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Selection */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2 font-normal">App theme</label>
                            <div className="grid grid-cols-6 gap-2">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all
                                            ${theme === t.id
                                                ? 'border-board-primary/30 bg-board-primary/5'
                                                : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg ${t.preview} shadow-sm`}></div>
                                        <span className="text-[10px] text-gray-500 font-normal">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-red-500 font-normal"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            {showCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors font-normal"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2.5 bg-board-primary text-white rounded-xl text-sm hover:bg-board-primaryHover disabled:opacity-50 transition-all font-normal flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Project'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectCreation;
