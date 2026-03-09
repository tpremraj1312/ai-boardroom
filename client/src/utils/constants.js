export const AGENTS = {
    CEO: { role: 'CEO', name: 'Chief Executive Officer', color: '#6C63FF', bgColor: '#6C63FF15', emoji: '♟️', tagline: 'Vision & Strategy' },
    CFO: { role: 'CFO', name: 'Chief Financial Officer', color: '#10B981', bgColor: '#10B98115', emoji: '📊', tagline: 'Finance & Projections' },
    CTO: { role: 'CTO', name: 'Chief Technology Officer', color: '#3B82F6', bgColor: '#3B82F615', emoji: '⚙️', tagline: 'Technology & Product' },
    CMO: { role: 'CMO', name: 'Chief Marketing Officer', color: '#F59E0B', bgColor: '#F59E0B15', emoji: '📣', tagline: 'Market & Growth' },
    INVESTOR: { role: 'INVESTOR', name: 'VC Partner', color: '#FFB830', bgColor: '#FFB83015', emoji: '💰', tagline: 'Funding & Risk' },
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
    { id: 'analysis', label: 'Analysis', icon: '🔍', description: 'Each agent independently analyzes your business' },
    { id: 'debate', label: 'Discussion', icon: '💬', description: 'Agents debate and challenge each other' },
    { id: 'verdict', label: 'Verdict', icon: '⚖️', description: 'CEO synthesizes the final strategy' },
];
