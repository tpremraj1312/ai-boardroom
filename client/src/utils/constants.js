export const AGENTS = {
  CEO: {
    role: "CEO",
    name: "Chief Executive Officer",
    color: "#6C63FF",
    bgColor: "#6C63FF15",
    emoji: "♟️",
    tagline: "Vision & Strategy",
  },
  CFO: {
    role: "CFO",
    name: "Chief Financial Officer",
    color: "#10B981",
    bgColor: "#10B98115",
    emoji: "📊",
    tagline: "Finance & Unit Economics",
  },
  CTO: {
    role: "CTO",
    name: "Chief Technology Officer",
    color: "#3B82F6",
    bgColor: "#3B82F615",
    emoji: "⚙️",
    tagline: "Technology & Architecture",
  },
  CMO: {
    role: "CMO",
    name: "Chief Marketing Officer",
    color: "#F59E0B",
    bgColor: "#F59E0B15",
    emoji: "📣",
    tagline: "Growth & Acquisition",
  },
  INVESTOR: {
    role: "INVESTOR",
    name: "VC Partner",
    color: "#EF4444",
    bgColor: "#EF444415",
    emoji: "💰",
    tagline: "Investment & Risk",
  },
};

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance & Fintech",
  "E-commerce & Retail",
  "Education & EdTech",
  "Real Estate",
  "Food & Beverage",
  "Manufacturing",
  "Professional Services",
  "Media & Entertainment",
  "Travel & Hospitality",
  "Other",
];

export const BUSINESS_STAGES = [
  {
    id: "idea",
    label: "Idea Stage",
    color: "#6C63FF",
    emoji:
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.967.714-1.815 1.667-2.019 1.122-.241 2.083-1.042 2.083-2.19V12a5.25 5.25 0 00-10.5 0v1.599c0 1.148.961 1.949 2.083 2.19.953.204 1.667 1.052 1.667 2.019V18m3.75-7.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
    description: "I have an idea but haven't built anything yet",
  },
  {
    id: "early",
    label: "Early Stage",
    color: "#10B981",
    emoji:
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>',
    description: "We have a product and some early customers",
  },
  {
    id: "growth",
    label: "Growth Stage",
    color: "#3B82F6",
    emoji:
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>',
    description: "We're growing but facing scaling challenges",
  },
  {
    id: "established",
    label: "Established",
    color: "#F59E0B",
    emoji:
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6.75h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>',
    description: "We're a mature business looking to expand",
  },
];

export const USER_TYPES = {
  entrepreneur: {
    label: "Entrepreneur",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.967.714-1.815 1.667-2.019 1.122-.241 2.083-1.042 2.083-2.19V12a5.25 5.25 0 00-10.5 0v1.599c0 1.148.961 1.949 2.083 2.19.953.204 1.667 1.052 1.667 2.019V18m3.75-7.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
    color: "#6C63FF",
    description: "I have a business idea",
  },
  startup: {
    label: "Startup",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.36 3 3 0 11-2.6-3.8l-.05-.09A8.99 8.99 0 011 10.9V10L14.9 1a9.99 9.99 0 014.25 3.32l1.64 2.2a2 2 0 01-.19 2.6l-5.01 5.25z" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 12l2 2m0-4l2 2" /></svg>',
    color: "#10B981",
    description: "I'm running a startup",
  },
  enterprise: {
    label: "Enterprise",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6.75h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>',
    color: "#FFB830",
    description: "I lead an established company",
  },
};

export const DEBATE_PHASES = [
  {
    id: "analysis",
    label: "Analysis",
    icon: "🔍",
    description: "Each advisor independently evaluates your business",
  },
  {
    id: "debate",
    label: "Cross-Exam",
    icon: "⚔️",
    description: "Advisors challenge and stress-test each other",
  },
  {
    id: "devils-advocate",
    label: "Devil's Advocate",
    icon: "😈",
    description: "Advisors attack the consensus to find blind spots",
  },
  {
    id: "verdict",
    label: "Verdict",
    icon: "⚖️",
    description: "CEO delivers the final strategic decision",
  },
];

export const INTENT_LABELS = {
  VALIDATE: { label: "Idea Validation", color: "#6C63FF", icon: "🧪" },
  FUNDRAISE: { label: "Fundraising Strategy", color: "#10B981", icon: "💰" },
  SCALE: { label: "Scaling Playbook", color: "#F59E0B", icon: "📈" },
  PIVOT: { label: "Pivot Analysis", color: "#EF4444", icon: "🔄" },
  LAUNCH: { label: "Go-to-Market", color: "#3B82F6", icon: "🚀" },
  OPTIMIZE: { label: "Optimization", color: "#8B5CF6", icon: "⚡" },
};
