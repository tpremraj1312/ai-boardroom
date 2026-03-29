import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import SiteRenderer from '../components/ui/SiteRenderer';
import { motion, AnimatePresence } from 'framer-motion';

const WebsiteGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [projectName, setProjectName] = useState('');
    const [brandKit, setBrandKit] = useState({ primaryColor: '#3b82f6', logoUrl: '' });
    
    const [activeWebsite, setActiveWebsite] = useState(null);
    const [history, setHistory] = useState([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [error, setError] = useState(null);
    
    const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/websites');
            setHistory(data);
            if (data.length > 0 && !activeWebsite) {
                setActiveWebsite(data[0]);
                setBrandKit(data[0].brandKit || { primaryColor: '#3b82f6', logoUrl: '' });
            }
        } catch (err) {
            console.error("Failed to fetch websites", err);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt || !projectName) return setError('Project name and prompt are required.');
        
        try {
            setError(null);
            setIsGenerating(true);
            const { data } = await api.post('/websites', {
                name: projectName,
                prompt,
                brandKit
            });
            setActiveWebsite(data);
            fetchHistory();
            setPrompt(''); // clear prompt after generation
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate website');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeploy = async () => {
        if (!activeWebsite) return;
        try {
            setIsDeploying(true);
            setError(null);
            const { data } = await api.post(`/websites/${activeWebsite._id}/deploy`);
            setActiveWebsite({ ...activeWebsite, deployedUrl: data.url });
            alert(`Deployed successfully at: ${data.url}`);
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.message || 'Deployment failed');
        } finally {
            setIsDeploying(false);
        }
    };

    const handleUpdateBrand = async () => {
        if (!activeWebsite) return;
        try {
            const { data } = await api.put(`/websites/${activeWebsite._id}`, { brandKit });
            setActiveWebsite(data);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    // Auto-save brandkit when user changes color after active website exists
    useEffect(() => {
        const debounce = setTimeout(() => {
            if (activeWebsite && activeWebsite._id && (activeWebsite.brandKit?.primaryColor !== brandKit.primaryColor || activeWebsite.brandKit?.logoUrl !== brandKit.logoUrl)) {
                handleUpdateBrand();
            }
        }, 1000);
        return () => clearTimeout(debounce);
    }, [brandKit]);

    const selectHistory = (site) => {
        setActiveWebsite(site);
        setBrandKit(site.brandKit || { primaryColor: '#3b82f6', logoUrl: '' });
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] bg-body-bg overflow-hidden relative">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-board-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* LEFTSIDEBAR: Controls */}
            <div className="w-80 border-r border-board-border bg-white/50 backdrop-blur-xl flex flex-col z-10">
                <div className="p-6 overflow-y-auto flex-1">
                    <h2 className="text-xl font-medium text-board-heading mb-6 tracking-tight">AI Site Builder</h2>
                    
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <Input 
                            label="Project Name"
                            placeholder="e.g. FitLife App"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="bg-gray-50/50"
                        />
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-board-textMain">Prompt Idea</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 p-4 min-h-[120px] bg-gray-50/50 focus:ring-2 focus:ring-board-primary/20 focus:border-board-primary transition-all resize-none text-sm placeholder:text-gray-400"
                                placeholder="Describe your startup. e.g. An AI-powered fitness app that tracks nutrition..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-sm font-medium text-board-danger bg-red-50 p-3 rounded-lg border border-red-100/50">{error}</p>}

                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isGenerating} 
                            className="w-full py-2.5 font-medium shadow-sm hover:-translate-y-0.5"
                        >
                            Generate Website
                        </Button>
                    </form>

                    <hr className="my-8 border-board-border" />

                    <h3 className="text-sm font-medium text-board-textSecondary uppercase tracking-wider mb-4">Brand Kit</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-medium text-board-textMain mb-2">Primary Color</label>
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="color" 
                                    value={brandKit.primaryColor}
                                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                />
                                <Input 
                                    value={brandKit.primaryColor}
                                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                                    className="bg-gray-50/50 flex-1 font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <Input 
                                label="Logo URL (Optional)"
                                placeholder="https://..."
                                value={brandKit.logoUrl}
                                onChange={(e) => setBrandKit({ ...brandKit, logoUrl: e.target.value })}
                                className="bg-gray-50/50"
                            />
                        </div>
                    </div>

                    {history.length > 0 && (
                        <>
                            <hr className="my-8 border-board-border" />
                            <h3 className="text-sm font-medium text-board-textSecondary uppercase tracking-wider mb-4">Past Projects</h3>
                            <div className="space-y-2">
                                {history.map(item => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => selectHistory(item)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${activeWebsite?._id === item._id ? 'border-board-primary bg-blue-50/50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                    >
                                        <p className="font-medium text-[15px] truncate">{item.name}</p>
                                        <p className="text-xs text-board-textSecondary truncate">{item.prompt}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* MAIN CANVAS */}
            <div className="flex-1 flex flex-col z-10">
                {/* Header Navbar */}
                <div className="h-16 border-b border-board-border bg-white flex items-center justify-between px-6 shadow-sm">
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Live Preview
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'code' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            React Code
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        {activeWebsite?.deployedUrl && (
                            <a href={activeWebsite.deployedUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-board-primary flex items-center hover:underline">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                Live URL
                            </a>
                        )}
                        <Button 
                            variant="primary" 
                            disabled={!activeWebsite} 
                            isLoading={isDeploying}
                            onClick={handleDeploy}
                            className="h-9 px-6 font-medium shadow-md hover:-translate-y-0.5 transition-transform"
                        >
                            {activeWebsite?.deployedUrl ? 'Deploy Updated Site' : '1-Click Deploy'}
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-gray-100/30">
                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div 
                                key="generating"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50"
                            >
                                <Spinner className="w-10 h-10 mb-4 text-board-primary" />
                                <p className="font-medium text-gray-700 animate-pulse">AI is writing code & designing UI...</p>
                            </motion.div>
                        ) : activeWebsite ? (
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="h-full w-full overflow-hidden flex flex-col p-6"
                            >
                                {activeTab === 'preview' ? (
                                    <div className="flex-1 bg-white rounded-xl shadow-[0_4px_30px_rgb(0,0,0,0.05)] border border-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                        <SiteRenderer content={activeWebsite.content} brandKit={brandKit} name={activeWebsite.name} />
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-[#d4d4d4]">
                                        <h3 className="text-[#ce9178] mb-4">// Generated React Component structure</h3>
                                        <pre>
{JSON.stringify(activeWebsite.content, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 flex flex-col items-center justify-center opacity-50"
                            >
                                <svg className="w-20 h-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                <p className="font-medium text-gray-500 text-lg">Describe an idea to generate a landing page</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WebsiteGenerator;
