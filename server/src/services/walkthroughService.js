/**
 * WALKTHROUGH AGENT SERVICE (Stage 5)
 * 
 * Generates comprehensive post-build documentation after code generation.
 * Produces a structured walkthrough that explains the entire application.
 */

import { generateAgentResponse } from './aiService.js';
import { getWalkthroughSystemPrompt, buildWalkthroughUserMessage } from './prompts/walkthroughPrompt.js';

/**
 * Generates a walkthrough for the given project.
 * Returns a structured walkthrough object.
 */
export const generateWalkthrough = async (fileSystem, blueprint = null, validationReport = null) => {
    console.log('[Walkthrough] Generating post-build walkthrough...');

    const systemPrompt = getWalkthroughSystemPrompt();
    const userMessage = buildWalkthroughUserMessage(fileSystem, blueprint, validationReport);

    try {
        const rawResponse = await generateAgentResponse({
            systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            requireJson: true
        });

        const cleaned = rawResponse
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '');

        const walkthrough = JSON.parse(cleaned);

        // Validate the walkthrough has required fields
        if (!walkthrough.title || !walkthrough.sections) {
            throw new Error('Walkthrough missing required fields (title, sections)');
        }

        console.log(`[Walkthrough] Generated: "${walkthrough.title}" with ${walkthrough.sections.length} sections`);

        return {
            ...walkthrough,
            generatedAt: new Date().toISOString(),
            fileCount: Object.keys(fileSystem).length
        };

    } catch (error) {
        console.error('[Walkthrough] Generation failed:', error.message);

        // Return a fallback walkthrough based on static analysis
        return generateFallbackWalkthrough(fileSystem, blueprint);
    }
};

/**
 * Generates a basic walkthrough from static file analysis when AI fails.
 */
const generateFallbackWalkthrough = (fileSystem, blueprint) => {
    const files = Object.keys(fileSystem);
    const clientFiles = files.filter(f => f.startsWith('client/'));
    const serverFiles = files.filter(f => f.startsWith('server/'));

    // Extract pages
    const pages = clientFiles.filter(f => f.includes('/pages/') || f.includes('/Pages/'));
    // Extract components
    const components = clientFiles.filter(f => f.includes('/components/') || f.includes('/Components/'));
    // Extract models
    const models = serverFiles.filter(f => f.includes('/models/') || f.includes('/Models/'));
    // Extract routes
    const routes = serverFiles.filter(f => f.includes('/routes/') || f.includes('/Routes/'));

    const sections = [
        {
            heading: 'Architecture Overview',
            content: `This is a full-stack application with ${clientFiles.length} frontend files and ${serverFiles.length} backend files. The frontend uses React with Vite and Tailwind CSS. The backend uses Node.js with Express and MongoDB.`
        },
        {
            heading: 'Frontend Structure',
            content: `The frontend contains ${pages.length} page(s) and ${components.length} component(s).\n\nPages:\n${pages.map(p => `- \`${p}\``).join('\n')}\n\nComponents:\n${components.map(c => `- \`${c}\``).join('\n')}`
        },
        {
            heading: 'Backend Structure',
            content: `The backend contains ${models.length} model(s) and ${routes.length} route file(s).\n\nModels:\n${models.map(m => `- \`${m}\``).join('\n')}\n\nRoutes:\n${routes.map(r => `- \`${r}\``).join('\n')}`
        },
        {
            heading: 'Getting Started',
            content: `1. Install frontend dependencies: \`cd client && npm install\`\n2. Install backend dependencies: \`cd server && npm install\`\n3. Start backend: \`cd server && npm run dev\`\n4. Start frontend: \`cd client && npm run dev\`\n5. Open browser at \`http://localhost:5173\``
        }
    ];

    const keyFiles = [
        ...pages.map(f => ({ file: f, purpose: 'Page component', importance: 'high' })),
        ...models.map(f => ({ file: f, purpose: 'Database model', importance: 'high' })),
        ...routes.map(f => ({ file: f, purpose: 'API routes', importance: 'high' }))
    ];

    return {
        title: blueprint?.intent_summary || 'Application Walkthrough',
        sections,
        keyFiles,
        apiEndpoints: [],
        techStack: {
            frontend: blueprint?.architecture?.frontend || 'React + Vite + Tailwind',
            backend: blueprint?.architecture?.backend || 'Node.js + Express',
            database: blueprint?.architecture?.database || 'MongoDB',
            deployment: 'Vercel (frontend) + Railway (backend)'
        },
        quickStart: 'cd client && npm install && npm run dev',
        generatedAt: new Date().toISOString(),
        fileCount: files.length,
        isFallback: true
    };
};
