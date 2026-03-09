import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const STEPS = [
    {
        id: 'persona',
        title: 'Your Persona',
        options: [
            { id: 'entrepreneur', label: 'Entrepreneur', desc: 'First-time founder with a new idea' },
            { id: 'startup', label: 'Startup Founder', desc: 'Early-stage startup facing challenges' },
            { id: 'enterprise', label: 'Enterprise Leader', desc: 'Established company seeking expansion' }
        ]
    },
    {
        id: 'stage',
        title: 'Business Stage',
        options: [
            { id: 'idea', label: 'Idea', desc: 'Pre-product, pre-revenue' },
            { id: 'early', label: 'Early', desc: 'MVP built, initial users' },
            { id: 'growth', label: 'Growth', desc: 'Scaling operations and revenue' },
            { id: 'established', label: 'Established', desc: 'Stable business looking for next steps' }
        ]
    },
    {
        id: 'industry',
        title: 'Industry',
        options: [
            { id: 'technology', label: 'Technology', desc: 'Software, Hardware, SaaS' },
            { id: 'healthcare', label: 'Healthcare', desc: 'MedTech, Pharma, Services' },
            { id: 'fintech', label: 'Fintech', desc: 'Payments, Crypto, Banking' },
            { id: 'retail', label: 'Retail', desc: 'E-commerce, D2C, Physical' },
            { id: 'education', label: 'Education', desc: 'EdTech, Services, Platforms' },
            { id: 'custom', label: 'Custom', desc: 'Other industries' }
        ]
    },
    {
        id: 'teamSize',
        title: 'Team Size',
        options: [
            { id: 'solo', label: 'Solo', desc: 'Just me' },
            { id: '2-10', label: '2-10', desc: 'Small founding team' },
            { id: '10-50', label: '10-50', desc: 'Growing organization' },
            { id: '50+', label: '50+', desc: 'Large workforce' }
        ]
    },
    {
        id: 'objective',
        title: 'Strategic Objective',
        options: [
            { id: 'fundraising', label: 'Fundraising', desc: 'Preparing for a funding round' },
            { id: 'launch', label: 'Product Launch', desc: 'Bringing a new product to market' },
            { id: 'expansion', label: 'Market Expansion', desc: 'Entering new markets or segments' },
            { id: 'optimization', label: 'Cost Optimization', desc: 'Improving unit economics' },
            { id: 'strategy', label: 'General Strategy', desc: 'Overall direction and advisory' }
        ]
    }
];

const OnboardingWizard = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        persona: '',
        stage: '',
        industry: '',
        teamSize: '',
        objective: ''
    });

    const step = STEPS[currentStep];

    const handleSelect = (optionId) => {
        setFormData(prev => ({ ...prev, [step.id]: optionId }));

        // Auto-advance after small delay if not the last step
        if (currentStep < STEPS.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            setTimeout(() => onComplete({ ...formData, [step.id]: optionId }), 300);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-white border border-board-border rounded-xl shadow-minimal overflow-hidden flex flex-col">
            {/* Progress Bar */}
            <div className="w-full bg-board-bgSecondary h-1">
                <div
                    className="bg-board-primary h-1 transition-all duration-300 ease-out"
                    style={{ width: `${((currentStep) / STEPS.length) * 100}%` }}
                />
            </div>

            <div className="p-8">
                <div className="mb-8">
                    <p className="text-xs font-semibold tracking-wider text-board-textSecondary uppercase mb-2">
                        Step {currentStep + 1} of {STEPS.length}
                    </p>
                    <h2 className="text-2xl font-bold text-board-heading">{step.title}</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            className="absolute inset-0 grid grid-cols-1 gap-3 content-start"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step.options.map((opt) => {
                                const isSelected = formData[step.id] === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(opt.id)}
                                        className={`flex items-start text-left p-4 rounded-lg border transition-all duration-200 w-full hover:bg-board-bgSecondary ${isSelected ? 'border-board-primary ring-1 ring-board-primary bg-blue-50/30' : 'border-board-border'
                                            }`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 mr-4 flex items-center justify-center transition-colors ${isSelected ? 'border-board-primary border-4' : 'border-gray-300'
                                            }`} />
                                        <div>
                                            <h4 className={`font-medium ${isSelected ? 'text-board-primary' : 'text-board-textMain'}`}>
                                                {opt.label}
                                            </h4>
                                            <p className="text-sm text-board-textSecondary mt-1">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-board-border">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className={currentStep === 0 ? 'invisible' : ''}
                    >
                        Back
                    </Button>
                    <div className="text-sm font-medium text-board-textSecondary">
                        {currentStep + 1} / {STEPS.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
