import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProjectStore from '../../store/projectStore';
import {
    VscPlay, VscFileMedia, VscCloudDownload, VscSymbolColor,
    VscWand, VscListFlat, VscLayoutSidebarLeft, VscFolder,
    VscTag, VscMegaphone, VscOrganization, VscPerson,
    VscLightbulb, VscHeart, VscRocket, VscStarFull,
    VscCalendar, VscGlobe, VscPaintcan, VscTextSize,
    VscSettingsGear, VscSmiley, VscBriefcase, VscPackage,
    VscHome, VscClose, VscChevronRight
} from 'react-icons/vsc';

/* ───────────────────────── CONSTANTS ───────────────────────── */

const CATEGORIES = [
    { id: 'professional', label: 'Professional', Icon: VscBriefcase },
    { id: 'artistic', label: 'Artistic', Icon: VscPaintcan },
    { id: 'product', label: 'Product', Icon: VscPackage },
    { id: 'lifestyle', label: 'Lifestyle', Icon: VscHeart },
    { id: 'technology', label: 'Technology', Icon: VscLightbulb },
    { id: 'food', label: 'Food & Beverage', Icon: VscSmiley },
    { id: 'fashion', label: 'Fashion', Icon: VscStarFull },
    { id: 'real-estate', label: 'Real Estate', Icon: VscHome },
];

const AD_TYPES = [
    'Social Media Ad', 'Print Poster', 'Web Banner',
    'Email Header', 'Billboard', 'Flyer', 'Story Ad'
];

const AUDIENCES = [
    'Gen Z (18-24)', 'Millennials (25-34)', 'Professionals (30-50)',
    'Enterprise / B2B', 'Parents & Families', 'Students',
    'Luxury Consumers', 'General Audience'
];

const BRAND_VOICES = [
    { id: 'formal', label: 'Formal', Icon: VscBriefcase },
    { id: 'casual', label: 'Casual', Icon: VscSmiley },
    { id: 'playful', label: 'Playful', Icon: VscHeart },
    { id: 'premium', label: 'Premium', Icon: VscStarFull },
    { id: 'tech', label: 'Tech-Forward', Icon: VscRocket },
    { id: 'minimal', label: 'Minimal', Icon: VscLayoutSidebarLeft },
];

const POSTER_SIZES = [
    { id: 'instagram-post', label: 'Instagram Post', dim: '1080 × 1080', short: 'Post' },
    { id: 'instagram-story', label: 'Instagram Story', dim: '1080 × 1920', short: 'Story' },
    { id: 'linkedin-ad', label: 'LinkedIn Ad', dim: '1200 × 627', short: 'LinkedIn' },
    { id: 'youtube-thumb', label: 'YouTube Thumbnail', dim: '1280 × 720', short: 'YouTube' },
    { id: 'website-banner', label: 'Website Banner', dim: '1920 × 600', short: 'Banner' },
    { id: 'facebook-ad', label: 'Facebook Ad', dim: '1200 × 628', short: 'Facebook' },
];

const VIDEO_SIZES = [
    { id: 'youtube-short', label: 'YouTube Short', dim: '1080 × 1920', short: 'Shorts' },
    { id: 'instagram-reel', label: 'Instagram Reel', dim: '1080 × 1920', short: 'Reel' },
    { id: 'youtube-long', label: '16:9 Long Video', dim: '1920 × 1080', short: 'Long Form' },
    { id: 'in-feed-vid', label: 'In-Feed Video', dim: '1080 × 1350', short: 'In-Feed' },
];

const PURPOSES = [
    { id: 'launch', label: 'Product Launch', Icon: VscRocket },
    { id: 'sale', label: 'Sale / Discount', Icon: VscTag },
    { id: 'awareness', label: 'Brand Awareness', Icon: VscMegaphone },
    { id: 'event', label: 'Event Promotion', Icon: VscCalendar },
    { id: 'testimonial', label: 'Testimonial', Icon: VscStarFull },
    { id: 'seasonal', label: 'Seasonal', Icon: VscGlobe },
];

const STYLE_TEMPLATES = [
    { id: 'minimal', label: 'Minimal', preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { id: 'modern-saas', label: 'Modern SaaS', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'dark-neon', label: 'Dark Neon', preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
    { id: 'cyberpunk', label: 'Cyberpunk', preview: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)' },
    { id: 'corporate', label: 'Corporate', preview: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'gen-z', label: 'Gen Z', preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fdfcfb 100%)' },
    { id: 'luxury', label: 'Luxury', preview: 'linear-gradient(135deg, #232526 0%, #414345 50%, #d4a574 100%)' },
    { id: 'nature', label: 'Nature', preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
];

const FONT_FAMILIES = [
    'Auto', 'Inter', 'Roboto', 'Poppins', 'Montserrat',
    'Playfair Display', 'Space Grotesk', 'DM Sans', 'Outfit'
];

const GRADIENT_PRESETS = [
    { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'forest', label: 'Forest', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'midnight', label: 'Midnight', css: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)' },
    { id: 'peach', label: 'Peach', css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'aurora', label: 'Aurora', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
];

const OUTPUT_FORMATS = ['PNG', 'JPG', 'WebP'];

/* ───────────────────────── SECTION LABEL ───────────────────────── */
const SectionLabel = ({ children, sub }) => (
    <div className="mb-2.5">
        <p className="text-[12px] tracking-[0.08em] uppercase text-gray-500 font-medium">{children}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-1 font-normal">{sub}</p>}
    </div>
);

/* ───────────────────────── TAG INPUT ───────────────────────── */
const TagInput = ({ tags, setTags, placeholder }) => {
    const [input, setInput] = useState('');
    const handleKey = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) setTags([...tags, input.trim()]);
            setInput('');
        }
        if (e.key === 'Backspace' && !input && tags.length) setTags(tags.slice(0, -1));
    };
    return (
        <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 min-h-[44px] cursor-text"
            onClick={() => document.getElementById('tag-input-el')?.focus()}>
            {tags.map(t => (
                <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[12px] font-normal">
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-blue-400 hover:text-blue-600 ml-1">×</button>
                </span>
            ))}
            <input id="tag-input-el" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[80px] bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400 font-normal" />
        </div>
    );
};

/* ───────────────────── PREVIOUS WORK PANEL ───────────────────── */
const PreviousWorkPanel = ({ creatives, onClose, onDownload, outputFormat }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col"
    >
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <VscFolder className="text-blue-500 text-[18px]" />
                <p className="text-[15px] text-gray-800 font-medium">Previous Work</p>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[12px] rounded-full font-normal">{creatives.length} items</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <VscClose className="text-gray-500 text-[18px]" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E9ECEF transparent' }}>
            {creatives.length === 0 ? (
                <div className="text-center py-20">
                    <VscFileMedia className="text-[32px] text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-[14px] font-normal">No creatives generated yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-5">
                    {creatives.map(creative => (
                        <motion.div key={creative._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl overflow-hidden border border-gray-200/60 bg-white group hover:shadow-lg transition-all">
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                {creative.type === 'video' ? (
                                    <video src={creative.url} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={creative.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button onClick={() => onDownload(creative.url, creative.type === 'video' ? 'mp4' : outputFormat.toLowerCase())}
                                        className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                                        <VscCloudDownload className="text-gray-800 text-[20px]" />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-white text-[11px] font-normal uppercase tracking-wider">{creative.type}</span>
                                </div>
                            </div>
                            <div className="p-3.5">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-[12px] text-gray-500 font-normal truncate">{creative.style}</span>
                                    <span className="text-[12px] text-gray-300">·</span>
                                    <span className="text-[12px] text-gray-500 font-normal truncate">{creative.template}</span>
                                </div>
                                <button onClick={() => onDownload(creative.url, creative.type === 'video' ? 'mp4' : outputFormat.toLowerCase())}
                                    className="w-full h-9 rounded-lg bg-gray-900 text-white text-[12px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-normal">
                                    <VscCloudDownload className="text-[14px]" /> Download
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    </motion.div>
);


/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */

const CreativeStudio = () => {
    const { activeProject, generateCreative, isGeneratingCreative } = useProjectStore();

    /* ── Left panel state ── */
    const [mediaType, setMediaType] = useState('image');
    const [category, setCategory] = useState('professional');
    const [adType, setAdType] = useState(AD_TYPES[0]);
    const [productName, setProductName] = useState('');
    const [tagline, setTagline] = useState('');
    const [contentDesc, setContentDesc] = useState('');
    const [audience, setAudience] = useState(AUDIENCES[7]);
    const [features, setFeatures] = useState([]);
    const [brandVoice, setBrandVoice] = useState('premium');

    /* ── Center panel state ── */
    const [posterSize, setPosterSize] = useState('instagram-post');
    const [purpose, setPurpose] = useState('launch');
    const [selectedStyle, setSelectedStyle] = useState('modern-saas');
    const [customPrompt, setCustomPrompt] = useState('');
    const [showPrevious, setShowPrevious] = useState(false);

    /* ── Right panel state ── */
    const [primaryColor, setPrimaryColor] = useState('#2563EB');
    const [secondaryColor, setSecondaryColor] = useState('#7C3AED');
    const [accentColor, setAccentColor] = useState('#F59E0B');
    const [fontFamily, setFontFamily] = useState('Auto');
    const [fontSize, setFontSize] = useState(50);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [bgType, setBgType] = useState('gradient');
    const [gradientPreset, setGradientPreset] = useState('sunset');
    const [autoMode, setAutoMode] = useState(true);
    const [outputFormat, setOutputFormat] = useState('PNG');
    const [opacity, setOpacity] = useState(100);
    const [contrast, setContrast] = useState(50);

    /* ── Results ── */
    const [generationPair, setGenerationPair] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const creatives = useMemo(() => {
        return activeProject?.creatives ? [...activeProject.creatives].reverse() : [];
    }, [activeProject?.creatives]);

    const currentSizeList = mediaType === 'video' ? VIDEO_SIZES : POSTER_SIZES;
    const currentSize = currentSizeList.find(s => s.id === posterSize) || currentSizeList[0];
    const templateLabel = currentSize?.label || 'Default Size';
    const styleLabel = STYLE_TEMPLATES.find(s => s.id === selectedStyle)?.label || 'Modern SaaS';
    const style2Label = (() => {
        const idx = STYLE_TEMPLATES.findIndex(s => s.id === selectedStyle);
        return STYLE_TEMPLATES[(idx + 1) % STYLE_TEMPLATES.length].label;
    })();

    /* ── Dual generation ── */
    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationPair(null);

        const contentDetails = {
            category, adType,
            productName: productName || activeProject?.name || '',
            tagline,
            description: contentDesc || activeProject?.prompt || '',
            targetAudience: audience, features, brandVoice,
            purpose: PURPOSES.find(p => p.id === purpose)?.label || '',
        };

        const designSettings = autoMode ? {} : {
            primaryColor, secondaryColor, accentColor, fontFamily,
            fontSize, letterSpacing, backgroundType: bgType,
            gradientPreset: bgType === 'gradient' ? gradientPreset : null,
            opacity, contrast, outputFormat,
        };

        const payload = { designSettings, contentDetails, customPrompt };

        try {
            const [res1, res2] = await Promise.allSettled([
                generateCreative(mediaType, templateLabel, styleLabel, payload),
                generateCreative(mediaType, templateLabel, style2Label, payload),
            ]);
            const pair = [];
            if (res1.status === 'fulfilled' && res1.value?.creatives?.length)
                pair.push(res1.value.creatives[res1.value.creatives.length - 1]);
            if (res2.status === 'fulfilled' && res2.value?.creatives?.length)
                pair.push(res2.value.creatives[res2.value.creatives.length - 1]);
            if (pair.length) setGenerationPair(pair);
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (url, format) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${(productName || activeProject?.name || 'creative').replace(/\s+/g, '_')}_${Date.now()}.${format.toLowerCase()}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    /* ═══════════════════════════ RENDER ═══════════════════════════ */
    return (
        <div className="flex h-full w-full overflow-hidden bg-[#f8f9fa]">

            {/* ════════════ LEFT PANEL — Content & Details ════════════ */}
            <div className="w-[320px] shrink-0 bg-white border-r border-gray-100 flex flex-col h-full min-h-0">
                {/* Header with Tool Toggle */}
                <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2.5 mb-3.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <VscLayoutSidebarLeft className="text-indigo-500 text-[16px]" />
                        </div>
                        <p className="text-[14px] text-gray-800 font-medium">Content & Details</p>
                    </div>
                    {/* Media Type Toggle */}
                    <div className="flex bg-gray-50/80 p-1.5 rounded-xl border border-gray-200/60 shadow-inner">
                        <button onClick={() => setMediaType('image')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${mediaType === 'image'
                                ? 'bg-white text-indigo-700 shadow-sm border border-gray-100/50 scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                }`}>
                            <VscFileMedia className="text-[14px]" /> Image Art
                        </button>
                        <button onClick={() => setMediaType('video')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${mediaType === 'video'
                                ? 'bg-white text-indigo-700 shadow-sm border border-gray-100/50 scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                }`}>
                            <VscPlay className="text-[14px]" /> Video Clip
                        </button>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E9ECEF transparent' }}>

                    {/* Category */}
                    <div>
                        <SectionLabel>Category</SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(c => {
                                const Icon = c.Icon;
                                return (
                                    <button key={c.id} onClick={() => setCategory(c.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] transition-all font-normal ${category === c.id
                                            ? 'border-indigo-200 bg-indigo-50/70 text-indigo-700 shadow-sm'
                                            : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50/50'
                                            }`}>
                                        <Icon className="text-[15px] shrink-0" />
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ad Type */}
                    <div>
                        <SectionLabel>Ad Type</SectionLabel>
                        <select value={adType} onChange={e => setAdType(e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-indigo-300 transition-colors font-normal cursor-pointer">
                            {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Product name */}
                    <div>
                        <SectionLabel>Product / Brand Name</SectionLabel>
                        <input value={productName} onChange={e => setProductName(e.target.value)}
                            placeholder={activeProject?.name || 'Enter product name'}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-indigo-300 transition-colors font-normal placeholder:text-gray-400" />
                    </div>

                    {/* Tagline */}
                    <div>
                        <SectionLabel>Tagline / Headline</SectionLabel>
                        <input value={tagline} onChange={e => setTagline(e.target.value)}
                            placeholder="e.g. Innovate. Create. Deliver."
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-indigo-300 transition-colors font-normal placeholder:text-gray-400" />
                    </div>

                    {/* Description */}
                    <div>
                        <SectionLabel>Content Description</SectionLabel>
                        <textarea value={contentDesc} onChange={e => setContentDesc(e.target.value)}
                            placeholder="Describe the product or campaign message..."
                            rows={3}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-indigo-300 transition-colors font-normal placeholder:text-gray-400 resize-none" />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <SectionLabel>Target Audience</SectionLabel>
                        <select value={audience} onChange={e => setAudience(e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-indigo-300 transition-colors font-normal cursor-pointer">
                            {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    {/* Key Features */}
                    <div>
                        <SectionLabel sub="Press enter to add">Key Features / USPs</SectionLabel>
                        <TagInput tags={features} setTags={setFeatures} placeholder="e.g. AI-Powered, Fast" />
                    </div>

                    {/* Brand Voice */}
                    <div>
                        <SectionLabel>Brand Voice</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {BRAND_VOICES.map(v => {
                                const Icon = v.Icon;
                                return (
                                    <button key={v.id} onClick={() => setBrandVoice(v.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-[12px] transition-all font-normal ${brandVoice === v.id
                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-100 text-gray-600 hover:border-gray-200'
                                            }`}>
                                        <Icon className="text-[14px]" />
                                        {v.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════ CENTER PANEL — Templates, Prompt & Results ════════════ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative bg-[#f8f9fa]">

                {/* ── Top bar: Type | Size | Previous Work ── */}
                <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-0 flex items-stretch h-[60px]">
                    {/* Type tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide mr-5">
                        {currentSizeList.map(s => (
                            <button key={s.id} onClick={() => setPosterSize(s.id)}
                                className={`px-4 py-2 rounded-lg text-[13px] whitespace-nowrap transition-all font-medium ${currentSize.id === s.id
                                    ? (mediaType === 'video' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-blue-600 text-white shadow-md shadow-blue-600/20')
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                    }`}>
                                {s.short}
                            </button>
                        ))}
                    </div>

                    {/* Size display */}
                    <div className="flex items-center gap-3 border-l border-gray-100 pl-5 mr-auto">
                        <div>
                            <p className="text-[18px] text-gray-800 font-semibold leading-tight tracking-tight">{currentSize?.dim}</p>
                            <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">{currentSize?.label}</p>
                        </div>
                    </div>

                    {/* Previous Work button */}
                    <div className="flex items-center">
                        <button onClick={() => setShowPrevious(true)}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all text-[13px] text-gray-700 font-medium shadow-sm">
                            <VscFolder className="text-[16px] text-blue-500" />
                            Previous Work
                            {creatives.length > 0 && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-[11px] rounded-full min-w-[22px] text-center font-medium shadow-inner">{creatives.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Purpose selector ── */}
                <div className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {PURPOSES.map(p => {
                            const Icon = p.Icon;
                            return (
                                <button key={p.id} onClick={() => setPurpose(p.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[12px] whitespace-nowrap transition-all font-medium ${purpose === p.id
                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                        : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                        }`}>
                                    <Icon className="text-[14px]" />
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Fixed main content (no scroll) ── */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">

                    {/* Style templates — compact row */}
                    <div className="shrink-0 mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <SectionLabel>Design Style Template</SectionLabel>
                        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                            {STYLE_TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => setSelectedStyle(t.id)}
                                    className={`shrink-0 w-[90px] rounded-xl overflow-hidden border-2 transition-all ${selectedStyle === t.id
                                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                    <div className="h-[46px] w-full relative" style={{ background: t.preview }}>
                                        {selectedStyle === t.id && (
                                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="py-1.5 px-2 bg-white">
                                        <p className={`text-[11px] text-center font-medium truncate ${selectedStyle === t.id ? 'text-blue-700' : 'text-gray-600'}`}>{t.label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results area — flexible space */}
                    <div className="flex-1 min-h-0 overflow-y-auto mb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E9ECEF transparent' }}>
                        <div className="h-full">
                            <AnimatePresence mode="wait">
                                {(isGenerating || isGeneratingCreative) ? (
                                    /* Loading */
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="h-full rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 flex flex-col items-center justify-center gap-4">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 border-[3px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                                            <div className="absolute inset-2 border-[3px] border-indigo-200 border-b-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.9s' }} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[16px] text-blue-900 font-medium">Crafting your campaign {mediaType === 'video' ? 'videos' : 'visuals'}</p>
                                            <p className="text-[13px] text-blue-600/80 mt-1 font-normal">Generating 2 professional variations</p>
                                        </div>
                                    </motion.div>
                                ) : generationPair && generationPair.length > 0 ? (
                                    /* Results */
                                    <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col h-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <VscStarFull className="text-amber-500 text-[16px]" />
                                                <p className="text-[14px] text-gray-800 font-medium">Ready to Export — {generationPair.length} Variations</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
                                            {generationPair.map((creative, idx) => (
                                                <motion.div key={creative._id || idx}
                                                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                                                    className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                                    <div className="flex-1 bg-gray-50 relative overflow-hidden min-h-0 flex items-center justify-center">
                                                        {creative.type === 'video' ? (
                                                            <video src={creative.url} autoPlay loop muted className="w-full h-full object-contain p-2 bg-black/5 rounded-lg" />
                                                        ) : (
                                                            <img src={creative.url} alt={`Variation ${idx + 1}`} className="w-full h-full object-contain p-2" />
                                                        )}
                                                        <div className="absolute top-3 left-3">
                                                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-gray-800 text-[11px] font-medium shadow-sm border border-gray-100 flex items-center gap-1.5">
                                                                {creative.type === 'video' ? <VscPlay className="text-[12px] text-blue-500" /> : <VscFileMedia className="text-[12px] text-blue-500" />}
                                                                Option {idx + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 shrink-0 flex items-center justify-between border-t border-gray-100">
                                                        <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{creative.style}</span>
                                                        <button onClick={() => handleDownload(creative.url, creative.type === 'video' ? 'mp4' : outputFormat)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[12px] hover:bg-gray-800 transition-colors font-medium">
                                                            <VscCloudDownload className="text-[14px]" /> Download
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* Empty state */
                                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="h-full rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-4 shadow-sm">
                                            <VscFileMedia className="text-[28px] text-indigo-400" />
                                        </div>
                                        <p className="text-gray-700 text-[15px] font-medium">No assets generated yet</p>
                                        <p className="text-gray-500 text-[13px] mt-1 font-normal max-w-[300px] text-center">Select your panel settings and click generate below to create professional assets.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Prompt + Generate — fixed at bottom */}
                    <div className="shrink-0 space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-auto">
                        <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                            placeholder="Describe your creative requirements... e.g. A sleek product showcase with floating 3D elements, soft ambient lighting, bold headline at top-left..."
                            rows={2}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-normal placeholder:text-gray-400 resize-none" />
                        <div className="flex items-center gap-4">
                            <button onClick={handleGenerate} disabled={isGenerating || isGeneratingCreative}
                                className={`flex-1 h-12 rounded-xl text-white text-[14px] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 font-medium ${mediaType === 'video'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-600/20'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-600/20'
                                    }`}>
                                {isGenerating || isGeneratingCreative ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating 2 Configurations...
                                    </>
                                ) : (
                                    <>
                                        {mediaType === 'video' ? <VscPlay className="text-[18px]" /> : <VscWand className="text-[18px]" />}
                                        Generate {mediaType === 'video' ? 'Campaign Videos' : 'Campaign Posters'}
                                    </>
                                )}
                            </button>
                            <span className="text-[11px] text-gray-500 font-medium w-[80px] text-center leading-tight uppercase tracking-wide">2 styles<br />generated</span>
                        </div>
                    </div>
                </div>

                {/* ── Previous Work overlay ── */}
                <AnimatePresence>
                    {showPrevious && (
                        <PreviousWorkPanel
                            creatives={creatives}
                            onClose={() => setShowPrevious(false)}
                            onDownload={handleDownload}
                            outputFormat={outputFormat}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* ════════════ RIGHT PANEL — Design Settings ════════════ */}
            <div className="w-[300px] shrink-0 bg-white border-l border-gray-100 flex flex-col h-full min-h-0">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                <VscSettingsGear className="text-violet-500 text-[16px]" />
                            </div>
                            <p className="text-[14px] text-gray-800 font-medium">Design Settings</p>
                        </div>
                        <button onClick={() => setAutoMode(!autoMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] border transition-all font-medium ${autoMode
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-gray-50 border-gray-200 text-gray-600'
                                }`}>
                            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${autoMode ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            Auto
                        </button>
                    </div>
                </div>

                {/* Scrollable settings */}
                <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-6 transition-opacity ${autoMode ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#E9ECEF transparent' }}>

                    {/* Color Palette */}
                    <div>
                        <SectionLabel>Color Palette</SectionLabel>
                        <div className="space-y-3">
                            {[
                                { label: 'Primary Brand Color', value: primaryColor, setter: setPrimaryColor },
                                { label: 'Secondary Tone', value: secondaryColor, setter: setSecondaryColor },
                                { label: 'Accent Highlights', value: accentColor, setter: setAccentColor },
                            ].map(c => (
                                <div key={c.label} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                    <input type="color" value={c.value} onChange={e => c.setter(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer appearance-none bg-white [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 shadow-sm" />
                                    <div className="flex-1">
                                        <p className="text-[12px] text-gray-700 font-medium">{c.label}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{c.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1.5 mt-3 justify-between">
                            {['#2563EB', '#7C3AED', '#059669', '#DC2626', '#EA580C', '#0891B2', '#4F46E5', '#BE185D'].map(hex => (
                                <button key={hex} onClick={() => setPrimaryColor(hex)}
                                    className="w-[26px] h-[26px] rounded-full border-2 border-white shadow-sm hover:scale-110 hover:shadow-md transition-all"
                                    style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                    </div>

                    {/* Font Family */}
                    <div>
                        <SectionLabel>Typography Family</SectionLabel>
                        <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 outline-none focus:border-violet-300 transition-colors font-medium cursor-pointer">
                            {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    {/* Text Size */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <SectionLabel>Global Text Scale</SectionLabel>
                        <div className="flex items-center gap-3">
                            <input type="range" min={20} max={100} value={fontSize}
                                onChange={e => setFontSize(Number(e.target.value))}
                                className="flex-1 h-1.5 accent-violet-500 cursor-pointer bg-gray-200 rounded-full" />
                            <span className="text-[12px] text-gray-600 w-8 text-right font-medium">{fontSize}</span>
                        </div>
                    </div>

                    {/* Background Type */}
                    <div>
                        <SectionLabel>Background Fill</SectionLabel>
                        <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            {['solid', 'gradient', 'pattern'].map(t => (
                                <button key={t} onClick={() => setBgType(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-[12px] capitalize transition-all font-medium ${bgType === t ? 'bg-white text-violet-700 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Presets */}
                    {bgType === 'gradient' && (
                        <div>
                            <SectionLabel>Gradient Scheme</SectionLabel>
                            <div className="grid grid-cols-2 gap-2">
                                {GRADIENT_PRESETS.map(g => (
                                    <button key={g.id} onClick={() => setGradientPreset(g.id)}
                                        className={`h-[40px] rounded-xl border-2 overflow-hidden transition-all ${gradientPreset === g.id ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                        <div className="w-full h-full relative" style={{ background: g.css }}>
                                            <span className="absolute bottom-1 left-2 text-[10px] text-white/90 font-medium drop-shadow-md">{g.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Output Format */}
                    <div>
                        <SectionLabel>Export Format</SectionLabel>
                        <div className="flex gap-2">
                            {OUTPUT_FORMATS.map(f => (
                                <button key={f} onClick={() => setOutputFormat(f)}
                                    className={`flex-1 py-2 rounded-xl border text-[12px] transition-all font-medium ${outputFormat === f ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                        }`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Auto mode indicator */}
                {autoMode && (
                    <div className="px-5 py-4 border-t border-gray-100 bg-emerald-50/50 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-[12px] text-emerald-700 font-medium leading-tight">AI will auto-select the optimal design configuration</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeStudio;
