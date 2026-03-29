import React from 'react';
import { motion } from 'framer-motion';

// Fallback Icon Renderer using basic shapes since we don't know if lucide-react is installed
const FallbackIcon = ({ name, color }) => {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    );
};

const SiteRenderer = ({ content, brandKit, name }) => {
    if (!content) return null;

    const brandColor = brandKit?.primaryColor || '#3b82f6';
    const logoUrl = brandKit?.logoUrl || null;

    return (
        <div className="min-h-full flex flex-col font-sans relative overflow-x-hidden">
            {/* INLINE CSS BLOCK FOR DYNAMIC THEME */}
            <style dangerouslySetInnerHTML={{__html: `
                .theme-text { color: ${brandColor}; }
                .theme-bg { background-color: ${brandColor}; }
                .theme-bg-soft { background-color: ${brandColor}15; }
                .theme-border { border-color: ${brandColor}; }
            `}} />

            {/* HEADER */}
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50"
            >
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg theme-bg flex items-center justify-center text-white font-medium text-sm">
                            {name?.charAt(0) || 'L'}
                        </div>
                    )}
                    <span className="font-medium text-xl text-gray-900 tracking-tight">{name}</span>
                </div>
                <button className="theme-bg text-white px-5 py-2 rounded-lg font-medium shadow-sm transition hover:opacity-90 active:scale-95 text-[15px]">
                    Get Started
                </button>
            </motion.header>

            {/* HERO SECTION */}
            <section className="flex-1 max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <h1 className="text-4xl md:text-[3.5rem] font-medium text-gray-900 tracking-tight leading-[1.15]">
                        {content.hero?.title}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-lg font-medium">
                        {content.hero?.subtitle}
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <button className="theme-bg text-white px-8 py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all w-full md:w-auto text-[15px]">
                            {content.hero?.ctaText}
                        </button>
                        <button className="bg-white text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors w-full md:w-auto text-[15px]">
                            Learn More
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 theme-bg-soft rounded-3xl transform rotate-3 scale-105"></div>
                    <img 
                        src={content.hero?.imageUrl || "https://source.unsplash.com/800x600/?technology,startup"} 
                        alt="Hero" 
                        className="relative rounded-3xl shadow-2xl object-cover h-[450px] w-full border border-gray-100/50" 
                    />
                </motion.div>
            </section>

            {/* FEATURES SECTION */}
            <section className="bg-gray-50/50 py-24 border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-medium text-gray-900 tracking-tight">Everything you need to scale</h2>
                        <p className="text-gray-500 mt-3 max-w-xl mx-auto">Powerful features designed to help your team work faster and smarter.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {content.features?.map((feature, i) => (
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 theme-bg-soft rounded-xl flex items-center justify-center mb-6 border border-gray-50">
                                    <FallbackIcon name={feature.icon} color={brandColor} />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-[15px]">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            {content.testimonials && content.testimonials.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-center text-3xl font-medium text-gray-900 mb-16 tracking-tight">Loved by early adopters</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {content.testimonials.map((test, i) => (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    key={i} 
                                    className="p-8 rounded-2xl theme-bg-soft border border-transparent hover:theme-border transition-colors"
                                >
                                    <div className="flex text-yellow-400 mb-4">
                                        {'★★★★★'.split('').map((star, j) => <span key={j}>{star}</span>)}
                                    </div>
                                    <p className="text-gray-800 text-lg italic mb-6">"{test.quote}"</p>
                                    <div>
                                        <p className="font-medium text-gray-900">{test.author}</p>
                                        <p className="text-sm text-gray-500">{test.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA SECTION */}
            <section className="theme-bg py-24 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-medium mb-6 tracking-tight leading-tight">{content.ctaSection?.title}</h2>
                    <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">{content.ctaSection?.subtitle}</p>
                    <button className="bg-white text-gray-900 px-10 py-4 rounded-xl font-medium shadow-xl hover:scale-105 transition-transform text-lg">
                        {content.ctaSection?.buttonText}
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
                <div className="mb-6 flex justify-center gap-6">
                    {content.footer?.links?.map((link, i) => (
                        <a key={i} href="#" className="hover:text-white transition-colors">{link}</a>
                    ))}
                </div>
                <p>{content.footer?.text}</p>
            </footer>
        </div>
    );
};

export default SiteRenderer;
