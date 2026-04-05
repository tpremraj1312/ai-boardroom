import Project from '../models/Project.js';
import { generateAgentResponse } from '../services/aiService.js';
import { generateBlueprint } from '../services/blueprintService.js';
import { generateCodeFromBlueprint } from '../services/codegenService.js';
import { runDebuggerAgent } from '../services/debuggerService.js';
import { generateWalkthrough } from '../services/walkthroughService.js';
import { validateProject } from '../services/validationService.js';
import { deployFullStack, deployToVercel } from '../services/deployService.js';
import { getViteReactTailwindTemplate } from '../services/templateService.js';
import { getChatIterationPrompt } from '../services/prompts/chatIterationPrompt.js';
import AdmZip from 'adm-zip';

// Helper to determine if query should expand to Team scope
const getAuthQuery = (req, projectId = null) => {
    const query = projectId ? { _id: projectId } : {};
    if (req.user && req.user.teamId) {
        query.$or = [{ user: req.user._id }, { team: req.user.teamId }];
    } else {
        query.user = req.user._id;
    }
    return query;
};

// ── GET all projects ────────────────────────────────────────────
export const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find(getAuthQuery(req))
            .select('name status version deployedUrl theme createdAt updatedAt team user')
            .populate('user', 'name')
            .sort({ updatedAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

// ── GET single project ──────────────────────────────────────────
export const getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// ── CREATE project (just metadata, no generation) ───────────────
export const createProject = async (req, res, next) => {
    try {
        const { name, prompt, theme } = req.body;
        if (!name || !prompt) return res.status(400).json({ message: 'Name and prompt are required.' });

        const baseFileSystem = getViteReactTailwindTemplate(name);

        const newProject = await Project.create({
            user: req.user._id,
            team: req.user.teamId || null,
            name,
            prompt,
            theme: theme || 'modern',
            status: 'idle',
            fileSystem: baseFileSystem,
            messages: [
                { role: 'user', content: prompt },
                { role: 'assistant', content: `Project "${name}" initialized. Click "Generate Blueprint" to create the architecture, then "Generate Code" to build it.` }
            ]
        });

        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
};

// ── GENERATE BLUEPRINT (Stage 1: Architect Agent) ───────────────
export const generateProjectBlueprint = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.status = 'generating-blueprint';
        await project.save();

        try {
            const blueprint = await generateBlueprint(project.prompt, project.theme);

            project.blueprint = blueprint;
            project.status = 'idle';
            project.messages.push({
                role: 'assistant',
                content: `Blueprint generated! I've planned ${blueprint.file_plan?.length || 0} files, ${blueprint.features?.length || 0} features, and ${blueprint.api_design?.length || 0} API endpoints. Review the blueprint and click "Build App" when ready.`
            });
            await project.save();

            res.status(200).json(project);
        } catch (aiError) {
            project.status = 'error';
            project.messages.push({ role: 'assistant', content: `Blueprint generation failed: ${aiError.message}` });
            await project.save();
            res.status(500).json({ message: aiError.message, project });
        }
    } catch (error) {
        next(error);
    }
};

// ── GENERATE CODE (Stage 2 + 4 + 5: Engineer → Debugger → Walkthrough) ──
export const generateProjectCode = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.blueprint) return res.status(400).json({ message: 'Generate blueprint first.' });

        project.status = 'generating-code';
        await project.save();

        try {
            // ── STAGE 2: Engineer Agent — Code Generation ──────────
            console.log(`[Orchestrator] Stage 2: Generating code for project ${project._id}...`);
            let fileSystem = await generateCodeFromBlueprint(project.blueprint, project.prompt);

            // ── STAGE 4: Debugger Agent — Validate & Auto-Fix ─────
            console.log(`[Orchestrator] Stage 4: Running Debugger Agent...`);
            const debugResult = await runDebuggerAgent(fileSystem, project.blueprint);
            fileSystem = debugResult.fileSystem;

            // ── STAGE 5: Walkthrough Agent — Documentation ────────
            console.log(`[Orchestrator] Stage 5: Generating Walkthrough...`);
            let walkthrough = null;
            try {
                walkthrough = await generateWalkthrough(
                    fileSystem,
                    project.blueprint,
                    debugResult.validationReport
                );
            } catch (walkErr) {
                console.error('[Orchestrator] Walkthrough generation failed (non-fatal):', walkErr.message);
            }

            // ── Persist everything ────────────────────────────────
            project.fileSystem = fileSystem;
            project.status = 'ready';
            project.version += 1;
            project.validationReport = debugResult.validationReport;
            project.debugLog = debugResult.debugLog;
            project.walkthrough = walkthrough;
            project.markModified('fileSystem');
            project.markModified('validationReport');
            project.markModified('debugLog');
            project.markModified('walkthrough');

            const fileCount = Object.keys(fileSystem).length;
            const validationStatus = debugResult.validationReport?.passed
                ? 'All checks passed.'
                : `${debugResult.validationReport?.errors || 0} issues remain.`;
            const walkthroughStatus = walkthrough ? ' Architecture walkthrough generated.' : '';

            project.messages.push({
                role: 'assistant',
                content: `Build complete! ${fileCount} files generated across frontend and backend. Debugger ran ${debugResult.debugCycles} auto-fix cycle(s). ${validationStatus}${walkthroughStatus} You can now edit files, preview, or deploy.`
            });
            await project.save();

            res.status(200).json(project);

        } catch (aiError) {
            project.status = 'error';
            project.messages.push({ role: 'assistant', content: `Code generation failed: ${aiError.message}` });
            await project.save();
            res.status(500).json({ message: aiError.message, project });
        }
    } catch (error) {
        next(error);
    }
};

// ── CHAT (iterative code modification) ──────────────────────────
export const chatProject = async (req, res, next) => {
    try {
        const { message } = req.body;
        const project = await Project.findOne(getAuthQuery(req, req.params.id));

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!message) return res.status(400).json({ message: 'Message is required' });

        // Build VFS context for the AI
        let currentFilesText = 'CURRENT VIRTUAL FILE SYSTEM:\n---\n';
        for (const [filepath, content] of Object.entries(project.fileSystem || {})) {
            currentFilesText += `File: ${filepath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        }

        const systemInstruction = getChatIterationPrompt(currentFilesText);

        // Add user message
        project.messages.push({ role: 'user', content: message });

        let aiJson;
        try {
            const rawResponse = await generateAgentResponse({
                systemPrompt: systemInstruction,
                messages: [{ role: 'user', content: message }],
                requireJson: true
            });
            let cleaned = rawResponse;
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            } else {
                cleaned = cleaned.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
            }
            aiJson = JSON.parse(cleaned);
        } catch (error) {
            console.error('[Chat] AI Parse Error:', error.message);
            project.messages.push({ role: 'assistant', content: 'I encountered an error processing that request. Could you try rephrasing it?' });
            await project.save();
            return res.status(500).json({ message: 'AI failed to format the response. Please try again.', project });
        }

        // Apply file operations
        if (aiJson.fileOperations && Array.isArray(aiJson.fileOperations)) {
            for (const op of aiJson.fileOperations) {
                if ((op.action === 'CREATE' || op.action === 'UPDATE') && op.file && op.content !== undefined) {
                    project.fileSystem[op.file] = op.content;
                } else if (op.action === 'DELETE' && op.file) {
                    delete project.fileSystem[op.file];
                }
            }
            project.markModified('fileSystem');
        }

        // ── Post-chat validation (lightweight) ────────────────────
        const report = validateProject(project.fileSystem, project.blueprint);
        project.validationReport = report;
        project.markModified('validationReport');

        const displayReply = aiJson.assistantResponse || 'I have updated your codebase.';
        project.messages.push({ role: 'assistant', content: displayReply });
        project.version += 1;
        project.status = 'ready';
        await project.save();

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// ── SAVE individual file edit ───────────────────────────────────
export const saveFile = async (req, res, next) => {
    try {
        const { filePath, content } = req.body;
        const project = await Project.findOne(getAuthQuery(req, req.params.id));

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!filePath) return res.status(400).json({ message: 'filePath is required' });

        project.fileSystem[filePath] = content;
        project.markModified('fileSystem');
        project.version += 1;
        await project.save();

        res.status(200).json({ message: 'File saved', version: project.version });
    } catch (error) {
        next(error);
    }
};

// ── DEPLOY (Full-Stack) ─────────────────────────────────────────
export const deployProject = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (!project.fileSystem || Object.keys(project.fileSystem).length === 0) {
            return res.status(400).json({ message: 'No files to deploy. Generate code first.' });
        }

        project.status = 'deploying';
        await project.save();

        try {
            // Use full-stack deployment
            const deployment = await deployFullStack(project);

            project.deployedUrl = deployment.url;
            project.status = 'deployed';

            let deployMsg = '';
            if (deployment.fullStack) {
                deployMsg = `Full-stack deployment complete!\n• Frontend: ${deployment.frontend?.url}\n• Backend: ${deployment.backend?.url}\n• Database: auto-provisioned`;
            } else if (deployment.frontend?.url) {
                deployMsg = `Frontend deployed successfully! Your app is live at: ${deployment.frontend.url}`;
                if (deployment.backend?.status === 'skipped') {
                    deployMsg += '\nNote: Backend deployment skipped (RAILWAY_TOKEN not configured). Add it in .env for full-stack deploy.';
                }
            } else {
                deployMsg = 'Deployment completed with partial success. Check the console for details.';
            }

            project.messages.push({ role: 'assistant', content: deployMsg });
            await project.save();

            res.status(200).json({ url: deployment.url, deployment, project });
        } catch (deployError) {
            project.status = 'ready';
            project.messages.push({ role: 'assistant', content: `Deployment failed: ${deployError.message}` });
            await project.save();
            res.status(500).json({ message: deployError.message, project });
        }
    } catch (error) {
        next(error);
    }
};

// ── GET WALKTHROUGH ─────────────────────────────────────────────
export const getProjectWalkthrough = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id))
            .select('walkthrough validationReport debugLog name');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.status(200).json({
            walkthrough: project.walkthrough,
            validationReport: project.validationReport,
            debugLog: project.debugLog
        });
    } catch (error) {
        next(error);
    }
};

// ── REGENERATE WALKTHROUGH ──────────────────────────────────────
export const regenerateWalkthrough = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.fileSystem || Object.keys(project.fileSystem).length === 0) {
            return res.status(400).json({ message: 'No files to generate walkthrough from.' });
        }

        const walkthrough = await generateWalkthrough(
            project.fileSystem,
            project.blueprint,
            project.validationReport
        );

        project.walkthrough = walkthrough;
        project.markModified('walkthrough');
        await project.save();

        res.status(200).json({ walkthrough });
    } catch (error) {
        next(error);
    }
};

// ── RERUN VALIDATION ────────────────────────────────────────────
export const revalidateProject = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const report = validateProject(project.fileSystem, project.blueprint);

        project.validationReport = report;
        project.markModified('validationReport');
        await project.save();

        res.status(200).json({ validationReport: report });
    } catch (error) {
        next(error);
    }
};

// ── RERUN DEBUGGER ──────────────────────────────────────────────
export const rerunDebugger = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.fileSystem || Object.keys(project.fileSystem).length === 0) {
            return res.status(400).json({ message: 'No files to debug.' });
        }

        const debugResult = await runDebuggerAgent(project.fileSystem, project.blueprint);

        project.fileSystem = debugResult.fileSystem;
        project.validationReport = debugResult.validationReport;
        project.debugLog = [...(project.debugLog || []), ...debugResult.debugLog];
        project.markModified('fileSystem');
        project.markModified('validationReport');
        project.markModified('debugLog');
        project.version += 1;
        await project.save();

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// ── EXPORT as ZIP ───────────────────────────────────────────────
export const exportProjectZip = async (req, res, next) => {
    try {
        const project = await Project.findOne(getAuthQuery(req, req.params.id));
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const zip = new AdmZip();
        for (const [filepath, content] of Object.entries(project.fileSystem || {})) {
            zip.addFile(filepath, Buffer.from(content, 'utf8'));
        }

        // Include walkthrough as WALKTHROUGH.md if exists
        if (project.walkthrough) {
            let walkthroughMd = `# ${project.walkthrough.title || project.name}\n\n`;
            if (project.walkthrough.sections) {
                for (const section of project.walkthrough.sections) {
                    walkthroughMd += `## ${section.heading}\n\n${section.content}\n\n`;
                }
            }
            if (project.walkthrough.quickStart) {
                walkthroughMd += `## Quick Start\n\n${project.walkthrough.quickStart}\n`;
            }
            zip.addFile('WALKTHROUGH.md', Buffer.from(walkthroughMd, 'utf8'));
        }

        const zipBuffer = zip.toBuffer();
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${project.name.replace(/\s+/g, '_')}_export.zip`);
        res.set('Content-Length', zipBuffer.length);
        res.send(zipBuffer);
    } catch (error) {
        next(error);
    }
};
