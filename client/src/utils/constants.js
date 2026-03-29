export const AGENTS = {
    CEO: { role: 'CEO', name: 'Chief Executive Officer', color: '#6C63FF', bgColor: '#6C63FF15', emoji: '♟️', tagline: 'Vision & Strategy' },
    CFO: { role: 'CFO', name: 'Chief Financial Officer', color: '#10B981', bgColor: '#10B98115', emoji: '📊', tagline: 'Finance & Unit Economics' },
    CTO: { role: 'CTO', name: 'Chief Technology Officer', color: '#3B82F6', bgColor: '#3B82F615', emoji: '⚙️', tagline: 'Technology & Architecture' },
    CMO: { role: 'CMO', name: 'Chief Marketing Officer', color: '#F59E0B', bgColor: '#F59E0B15', emoji: '📣', tagline: 'Growth & Acquisition' },
    INVESTOR: { role: 'INVESTOR', name: 'VC Partner', color: '#EF4444', bgColor: '#EF444415', emoji: '💰', tagline: 'Investment & Risk' },
};

export const INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance & Fintech', 'E-commerce & Retail',
    'Education & EdTech', 'Real Estate', 'Food & Beverage', 'Manufacturing',
    'Professional Services', 'Media & Entertainment', 'Travel & Hospitality', 'Other'
];

export const BUSINESS_STAGES = [
    { id: 'idea', label: 'Idea Stage', emoji: '💡', description: "I have an idea but haven't built anything yet" },
    { id: 'early', label: 'Early Stage', emoji: '🌱', description: 'We have a product and some early customers' },
    { id: 'growth', label: 'Growth Stage', emoji: '📈', description: "We're growing but facing scaling challenges" },
    { id: 'established', label: 'Established', emoji: '🏢', description: "We're a mature business looking to expand" },
];

export const USER_TYPES = {
    entrepreneur: { label: 'Entrepreneur', icon: '💡', color: '#6C63FF', description: 'I have a business idea' },
    startup: { label: 'Startup', icon: '🚀', color: '#10B981', description: "I'm running a startup" },
    enterprise: { label: 'Enterprise', icon: '🏢', color: '#FFB830', description: 'I lead an established company' },
};

export const DEBATE_PHASES = [
    { id: 'analysis', label: 'Analysis', icon: '🔍', description: 'Each advisor independently evaluates your business' },
    { id: 'debate', label: 'Cross-Exam', icon: '⚔️', description: 'Advisors challenge and stress-test each other' },
    { id: 'devils-advocate', label: "Devil's Advocate", icon: '😈', description: 'Advisors attack the consensus to find blind spots' },
    { id: 'verdict', label: 'Verdict', icon: '⚖️', description: 'CEO delivers the final strategic decision' },
];

export const INTENT_LABELS = {
    VALIDATE: { label: 'Idea Validation', color: '#6C63FF', icon: '🧪' },
    FUNDRAISE: { label: 'Fundraising Strategy', color: '#10B981', icon: '💰' },
    SCALE: { label: 'Scaling Playbook', color: '#F59E0B', icon: '📈' },
    PIVOT: { label: 'Pivot Analysis', color: '#EF4444', icon: '🔄' },
    LAUNCH: { label: 'Go-to-Market', color: '#3B82F6', icon: '🚀' },
    OPTIMIZE: { label: 'Optimization', color: '#8B5CF6', icon: '⚡' },
};
