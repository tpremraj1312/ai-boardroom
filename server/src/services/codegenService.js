import { generateAgentResponse } from './aiService.js';
import { getCodegenSystemPrompt, buildCodegenUserMessage } from './prompts/codegenPrompt.js';

/**
 * Safely extracts JSON from a raw AI response that may contain
 * markdown wrappers, conversational filler, or other non-JSON text.
 */
const extractJSON = (raw) => {
    // Strategy 1: Direct parse
    try {
        return JSON.parse(raw);
    } catch (e) { /* continue */ }

    // Strategy 2: Find first { to last }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        try {
            return JSON.parse(raw.substring(start, end + 1));
        } catch (e) { /* continue */ }
    }

    // Strategy 3: Strip markdown fences
    const stripped = raw.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
    try {
        return JSON.parse(stripped);
    } catch (e) { /* continue */ }

    throw new Error('Could not extract valid JSON from AI response');
};

/**
 * Transforms the AI response (which could be in multiple formats)
 * into a flat { "file/path": "content" } VFS map.
 */
const normalizeToVFS = (result) => {
    let fileSystem = {};

    if (result.files && Array.isArray(result.files)) {
        for (const item of result.files) {
            if (item.file_path && item.content) {
                fileSystem[item.file_path] = item.content;
            }
        }
    } else if (result.files && typeof result.files === 'object') {
        fileSystem = result.files;
    } else {
        // Maybe the result IS the file map directly
        const keys = Object.keys(result);
        if (keys.length > 0 && typeof result[keys[0]] === 'string') {
            fileSystem = result;
        }
    }

    return fileSystem;
};

/**
 * Generates complete code files from a blueprint using multi-pass generation.
 * 
 * PASS 1: Generate all FRONTEND files (client/*)
 * PASS 2: Generate all BACKEND files (server/*)
 * 
 * This ensures we get comprehensive, non-truncated output for both halves
 * of the full-stack application, similar to how Bolt/Lovable generate massive apps.
 */
export const generateCodeFromBlueprint = async (blueprint, prompt) => {
    const systemPrompt = getCodegenSystemPrompt();

    // Separate the file plan into frontend and backend
    const filePlan = blueprint?.file_plan || [];
    const frontendFiles = filePlan.filter(f => f.file_path?.startsWith('client/'));
    const backendFiles = filePlan.filter(f => !f.file_path?.startsWith('client/'));

    let fullFileSystem = {};

    // ── PASS 1: FRONTEND ────────────────────────────────────────────
    if (frontendFiles.length > 0) {
        console.log(`[CodegenService] Pass 1: Generating ${frontendFiles.length} FRONTEND files...`);

        const frontendBlueprint = {
            ...blueprint,
            file_plan: frontendFiles,
            _pass: 'FRONTEND_ONLY'
        };

        const frontendMessage = buildCodegenUserMessage(frontendBlueprint, prompt) +
            '\n\nIMPORTANT: This is PASS 1 — generate ONLY the FRONTEND (client/*) files listed in the file_plan. Write complete, production-grade code for every file. Do NOT abbreviate.';

        try {
            const rawFrontend = await generateAgentResponse({
                systemPrompt,
                messages: [{ role: 'user', content: frontendMessage }],
                requireJson: true
            });

            const frontendResult = extractJSON(rawFrontend);
            const frontendVFS = normalizeToVFS(frontendResult);
            const count = Object.keys(frontendVFS).length;
            console.log(`[CodegenService] Pass 1 complete: ${count} frontend files generated`);
            Object.assign(fullFileSystem, frontendVFS);
        } catch (error) {
            console.error('[CodegenService] Frontend pass failed:', error.message);
        }
    }

    // ── PASS 2: BACKEND ─────────────────────────────────────────────
    if (backendFiles.length > 0) {
        console.log(`[CodegenService] Pass 2: Generating ${backendFiles.length} BACKEND files...`);

        const backendBlueprint = {
            ...blueprint,
            file_plan: backendFiles,
            _pass: 'BACKEND_ONLY'
        };

        const backendMessage = buildCodegenUserMessage(backendBlueprint, prompt) +
            '\n\nIMPORTANT: This is PASS 2 — generate ONLY the BACKEND (server/*) files listed in the file_plan. Write complete, production-grade code for every file. Do NOT abbreviate.';

        try {
            const rawBackend = await generateAgentResponse({
                systemPrompt,
                messages: [{ role: 'user', content: backendMessage }],
                requireJson: true
            });

            const backendResult = extractJSON(rawBackend);
            const backendVFS = normalizeToVFS(backendResult);
            const count = Object.keys(backendVFS).length;
            console.log(`[CodegenService] Pass 2 complete: ${count} backend files generated`);
            Object.assign(fullFileSystem, backendVFS);
        } catch (error) {
            console.error('[CodegenService] Backend pass failed:', error.message);
        }
    }

    // ── FALLBACK: Single-pass if no file_plan was found ─────────────
    if (Object.keys(fullFileSystem).length === 0) {
        console.log('[CodegenService] Multi-pass produced no files, trying single-pass fallback...');

        const userMessage = buildCodegenUserMessage(blueprint, prompt);
        const rawResponse = await generateAgentResponse({
            systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            requireJson: true
        });

        const result = extractJSON(rawResponse);
        fullFileSystem = normalizeToVFS(result);
    }

    // ── VALIDATION ──────────────────────────────────────────────────
    const fileCount = Object.keys(fullFileSystem).length;
    if (fileCount < 1) {
        throw new Error('No files generated by STAGE 2 Execution Engine. The AI returned empty output.');
    }

    console.log(`[CodegenService] Total files generated: ${fileCount}`);

    // ── BLUEPRINT ENFORCEMENT ───────────────────────────────────────
    if (filePlan.length > 0) {
        const generatedPaths = new Set(Object.keys(fullFileSystem));
        const missingPlanned = filePlan
            .filter(f => f.operation !== 'delete' && !generatedPaths.has(f.file_path))
            .map(f => f.file_path);

        if (missingPlanned.length > 0) {
            console.warn(`[CodegenService] Blueprint enforcement: ${missingPlanned.length} planned files missing:`);
            missingPlanned.forEach(f => console.warn(`  - ${f}`));
        }
    }

    // Ensure README exists
    if (!fullFileSystem['README.md']) {
        const projectName = blueprint?.intent_summary?.substring(0, 50) || 'Generated Project';
        fullFileSystem['README.md'] = `# ${projectName}\n\n${blueprint?.intent_summary || ''}\n\nGenerated by Multi-Agent AI System (GROK → GEMINI).`;
    }

    return fullFileSystem;
};
