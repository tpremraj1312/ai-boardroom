/**
 * Compiles a rich, high-converting marketing prompt for AI generation.
 * Enhanced to accept detailed content, design settings, and audience configuration
 * from the 3-panel AI Studio interface.
 *
 * @param {Object} project   - { name, description, targetAudience }
 * @param {String} template  - Platform format e.g. 'Instagram Post'
 * @param {String} style     - Aesthetic e.g. 'Cyberpunk', 'Modern SaaS'
 * @param {Object} brandKit  - Optional { colors, fonts, logoUrl }
 * @param {Object} designSettings - Extended design configuration from the right panel
 * @param {Object} contentDetails - Content metadata from the left panel
 * @returns {String} Complete prompt string for DALL-E or Video APIs
 */
export const buildCreativePrompt = (project, template, style, brandKit, designSettings = {}, contentDetails = {}) => {
    const parts = [];

    // ── Core identity ──
    parts.push(`Create a highly polished, professional marketing ${template} for an application named "${project.name}".`);
    parts.push(`The application is described as: "${project.description}".`);

    // ── Content details from left panel ──
    if (contentDetails.category) {
        parts.push(`Category: ${contentDetails.category}.`);
    }
    if (contentDetails.adType) {
        parts.push(`This is a ${contentDetails.adType} advertisement.`);
    }
    if (contentDetails.productName) {
        parts.push(`Product name to feature: "${contentDetails.productName}".`);
    }
    if (contentDetails.tagline) {
        parts.push(`Tagline / headline text: "${contentDetails.tagline}".`);
    }
    if (contentDetails.description) {
        parts.push(`Ad copy / description: "${contentDetails.description}".`);
    }
    if (contentDetails.targetAudience) {
        parts.push(`Target audience: ${contentDetails.targetAudience}.`);
    } else if (project.targetAudience) {
        parts.push(`Target audience: ${project.targetAudience}.`);
    }
    if (contentDetails.features && contentDetails.features.length > 0) {
        parts.push(`Key product features / USPs to highlight: ${contentDetails.features.join(', ')}.`);
    }
    if (contentDetails.brandVoice) {
        parts.push(`Brand voice / tone: ${contentDetails.brandVoice}.`);
    }

    // ── Purpose from center panel ──
    if (contentDetails.purpose) {
        parts.push(`Campaign purpose: ${contentDetails.purpose}.`);
    }

    // ── Aesthetic style ──
    parts.push(`\nAesthetic Style: ${style}.`);

    // ── Design settings from right panel ──
    if (designSettings.primaryColor || designSettings.secondaryColor || designSettings.accentColor) {
        const colors = [
            designSettings.primaryColor && `primary: ${designSettings.primaryColor}`,
            designSettings.secondaryColor && `secondary: ${designSettings.secondaryColor}`,
            designSettings.accentColor && `accent: ${designSettings.accentColor}`
        ].filter(Boolean).join(', ');
        parts.push(`Use these specific brand colors: ${colors}.`);
    }

    if (designSettings.fontFamily && designSettings.fontFamily !== 'Auto') {
        parts.push(`Typography should resemble the "${designSettings.fontFamily}" font family aesthetic.`);
    }

    if (designSettings.backgroundType) {
        if (designSettings.backgroundType === 'gradient' && designSettings.gradientPreset) {
            parts.push(`Background should use a ${designSettings.gradientPreset} gradient style.`);
        } else if (designSettings.backgroundType === 'solid') {
            parts.push(`Background should be a clean solid color.`);
        } else if (designSettings.backgroundType === 'pattern') {
            parts.push(`Background should include subtle geometric or abstract patterns.`);
        }
    }

    // ── Brand Kit integration ──
    if (brandKit && brandKit.colors && brandKit.colors.length > 0) {
        parts.push(`Incorporate these additional brand colors: ${brandKit.colors.join(', ')}.`);
    }

    // ── Critical directives ──
    parts.push(`
CRITICAL DIRECTIVES:
- Ensure the layout matches the standard aspect ratio for a ${template}.
- Use high-contrast, beautiful lighting, and modern, clean typographic layouts (if text is rendered).
- The visual should look like a premium, enterprise-grade advertisement ready to be published.
- Do not use generic stock-photo aesthetics. Make it conceptually engaging, matching the "${style}" aesthetic perfectly.
- The design should feel campaign-ready and suitable for immediate deployment across digital channels.`);

    return parts.join(' ');
};
