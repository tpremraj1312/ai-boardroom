import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import clsx from 'clsx';
import { INDUSTRIES, BUSINESS_STAGES, USER_TYPES } from '../utils/constants';

const BoardroomSetup = () => {
    const navigate = useNavigate();
    const { createSession } = useSessionStore();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        userType: 'startup',
        businessName: '',
        industry: INDUSTRIES[0],
        stage: 'early',
        description: '',
        goals: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.businessName || !formData.description) return;

        setIsLoading(true);
        try {
            const session = await createSession({
                userType: formData.userType,
                inputData: {
                    businessName: formData.businessName,
                    industry: formData.industry,
                    stage: formData.stage,
                    description: formData.description,
                    goals: formData.goals,
                }
            });

            // If file was uploaded, push it to RAG endpoint
            if (file) {
                const formArgs = new FormData();
                formArgs.append('file', file);
                formArgs.append('sessionId', session._id);
                try {
                    await api.post('/documents/upload', formArgs, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (docErr) {
                    console.error('Document upload error', docErr);
                }
            }

            navigate(`/boardroom/${session._id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-y-auto py-12 px-4 sm:px-6 relative bg-board-bgSecondary">
            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <Badge step={step} />
                    <h1 className="text-3xl sm:text-4xl font-bold text-board-heading mt-4">
                        {step === 1 ? 'Define Your Context' : step === 2 ? 'Upload Knowledge Base' : 'Pitch Your Business'}
                    </h1>
                    <p className="text-board-textSecondary mt-2">
                        {step === 1
                            ? 'Tell us who you are so the board can tailor its approach.'
                            : step === 2
                                ? 'Upload existing pitch decks or PDF reports for the agents to analyze.'
                                : 'Give the board the details they need to analyze your strategy.'}
                    </p>
                </div>

                <Card className="p-6 sm:p-10 border-board-border bg-white shadow-minimal">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-semibold text-board-heading mb-4">Your Persona</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {Object.entries(USER_TYPES).map(([key, type]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleChange('userType', key)}
                                                    className={clsx(
                                                        'flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-200',
                                                        formData.userType === key
                                                            ? 'bg-blue-50 border-board-primary shadow-sm'
                                                            : 'bg-white border-board-border hover:border-board-primary/30 hover:bg-board-bgSecondary'
                                                    )}
                                                >
                                                    <span className="text-3xl mb-2">{type.icon}</span>
                                                    <span className="font-bold text-board-heading text-sm mb-1">{type.label}</span>
                                                    <span className="text-xs text-board-textSecondary">{type.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-board-heading mb-4">Business Stage</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {BUSINESS_STAGES.map((stage) => (
                                                <button
                                                    key={stage.id}
                                                    type="button"
                                                    onClick={() => handleChange('stage', stage.id)}
                                                    className={clsx(
                                                        'flex items-center p-3 rounded-xl border transition-all duration-200 text-left',
                                                        formData.stage === stage.id
                                                            ? 'bg-blue-50 border-board-primary shadow-sm'
                                                            : 'bg-white border-board-border hover:border-board-primary/30 hover:bg-board-bgSecondary'
                                                    )}
                                                >
                                                    <span className="text-2xl mr-3">{stage.emoji}</span>
                                                    <div>
                                                        <p className="font-bold text-board-heading text-sm">{stage.label}</p>
                                                        <p className="text-xs text-board-textSecondary leading-snug">{stage.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-board-border flex justify-end">
                                        <Button variant="primary" size="lg" onClick={handleNext}>
                                            Next Step →
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-board-border rounded-xl p-10 flex flex-col justify-center items-center bg-board-bgSecondary/30">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 text-board-primary flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-board-heading">Upload Pitch Deck or Report</h3>
                                        <p className="text-sm text-board-textSecondary mb-6 mt-1 text-center max-w-sm">Provide background context for the AI agents via RAG (Retrieval-Augmented Generation). Supports PDF or TXT.</p>

                                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-board-primary hover:bg-board-primaryHover">
                                            <span>Select File</span>
                                            <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                                        </label>

                                        {file && (
                                            <div className="mt-4 flex items-center bg-white border border-board-border rounded-lg px-4 py-2">
                                                <span className="text-sm font-medium text-board-heading">{file.name}</span>
                                                <button type="button" onClick={() => setFile(null)} className="ml-3 text-board-danger hover:text-red-700">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-board-border flex justify-between items-center">
                                        <Button type="button" variant="ghost" onClick={handleBack}>
                                            ← Back
                                        </Button>
                                        <Button variant="primary" size="lg" onClick={handleNext}>
                                            Next Step →
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Input
                                            label="Business Name"
                                            value={formData.businessName}
                                            onChange={(e) => handleChange('businessName', e.target.value)}
                                            placeholder="e.g. Acme Corp"
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-board-heading mb-1.5 ml-1">Industry</label>
                                            <select
                                                value={formData.industry}
                                                onChange={(e) => handleChange('industry', e.target.value)}
                                                className="block w-full rounded-lg bg-white border border-board-border text-board-textMain px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-board-primary/20 focus:border-board-primary sm:text-sm appearance-none"
                                            >
                                                {INDUSTRIES.map(ind => (
                                                    <option key={ind} value={ind}>{ind}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Input
                                        as="textarea"
                                        label="The Pitch (Business Description)"
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Describe your product, target audience, and business model in detail. The more context you provide, the better the board's analysis will be."
                                        required
                                        className="min-h-[150px]"
                                    />

                                    <Input
                                        as="textarea"
                                        label="Primary Goals or Specific Challenges (Optional)"
                                        value={formData.goals}
                                        onChange={(e) => handleChange('goals', e.target.value)}
                                        placeholder="e.g. Seeking $2M seed funding, struggling with high customer churn, figuring out pricing model..."
                                        className="min-h-[100px]"
                                    />

                                    <div className="pt-6 border-t border-board-border flex justify-between items-center">
                                        <Button type="button" variant="ghost" onClick={handleBack} disabled={isLoading}>
                                            ← Back
                                        </Button>
                                        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                                            Convene the Board
                                        </Button>
                                    </div>

                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
};

// Helper component for setup flow
const Badge = ({ step }) => (
    <div className="inline-flex items-center justify-center space-x-2 bg-white border border-board-border shadow-minimal rounded-full p-1">
        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step === 1 ? "bg-board-primary text-white" : "text-board-textSecondary hover:bg-board-bgSecondary")}>
            1
        </div>
        <div className="w-4 h-px bg-board-border"></div>
        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step === 2 ? "bg-board-primary text-white" : "text-board-textSecondary hover:bg-board-bgSecondary")}>
            2
        </div>
        <div className="w-4 h-px bg-board-border"></div>
        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step === 3 ? "bg-board-primary text-white" : "text-board-textSecondary hover:bg-board-bgSecondary")}>
            3
        </div>
    </div>
);

export default BoardroomSetup;
