/**
 * SELF-VALIDATION PIPELINE
 * 
 * Performs automated checks on generated code to ensure:
 * 1. All imports resolve to existing files in the VFS
 * 2. All frontend API calls have matching backend routes
 * 3. All backend model references exist
 * 4. No placeholder/TODO content remains
 * 5. Blueprint file_plan maps 1:1 to generated files
 */

// ── Import Resolution Checker ──────────────────────────────────────
const validateImports = (fileSystem) => {
    const issues = [];
    const filePaths = Object.keys(fileSystem);

    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (!content || typeof content !== 'string') continue;
        // Only check JS/JSX/TS/TSX files
        if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) continue;

        // Match import statements: import X from './path' or import X from '../path'
        const importRegex = /import\s+(?:[\w{}\s,*]+)\s+from\s+['"](\.[^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            const resolvedPath = resolveImportPath(filePath, importPath, filePaths);
            if (!resolvedPath) {
                issues.push({
                    type: 'BROKEN_IMPORT',
                    severity: 'error',
                    file: filePath,
                    detail: `Import "${importPath}" does not resolve to any file in the project`,
                    importPath
                });
            }
        }
    }

    return issues;
};

// ── Resolve relative import to actual VFS path ──────────────────────
const resolveImportPath = (currentFile, importPath, allFiles) => {
    // Get directory of current file
    const parts = currentFile.split('/');
    parts.pop();
    const currentDir = parts.join('/');

    // Resolve relative path
    let resolved = importPath;
    if (importPath.startsWith('./')) {
        resolved = currentDir ? `${currentDir}/${importPath.slice(2)}` : importPath.slice(2);
    } else if (importPath.startsWith('../')) {
        const segments = currentDir.split('/');
        let remaining = importPath;
        while (remaining.startsWith('../')) {
            segments.pop();
            remaining = remaining.slice(3);
        }
        resolved = segments.length > 0 ? `${segments.join('/')}/${remaining}` : remaining;
    }

    // Normalize path
    resolved = resolved.replace(/\/+/g, '/');

    // Extensions to try
    const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
        if (allFiles.includes(resolved + ext)) return resolved + ext;
    }

    return null;
};

// ── API Route Consistency Checker ───────────────────────────────────
const validateApiRouteConsistency = (fileSystem) => {
    const issues = [];

    // Extract API calls from frontend files
    const frontendCalls = [];
    const backendRoutes = [];

    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (!content || typeof content !== 'string') continue;

        // Frontend: Find API calls (fetch, axios, api.get/post/put/delete)
        if (filePath.startsWith('client/')) {
            const apiCallRegex = /(?:fetch|axios|api)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*[`'"]([^`'"]+)[`'"]/gi;
            let match;
            while ((match = apiCallRegex.exec(content)) !== null) {
                frontendCalls.push({
                    method: match[1].toUpperCase(),
                    path: match[2].replace(/\$\{[^}]+\}/g, ':param'),
                    file: filePath
                });
            }

            // Also check template literal API calls
            const templateCallRegex = /(?:fetch|axios|api)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/gi;
            while ((match = templateCallRegex.exec(content)) !== null) {
                const path = match[2].replace(/\$\{[^}]+\}/g, ':param');
                frontendCalls.push({
                    method: match[1].toUpperCase(),
                    path,
                    file: filePath
                });
            }
        }

        // Backend: Find route definitions
        if (filePath.startsWith('server/')) {
            const routeRegex = /router\s*\.\s*(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
            let match;
            while ((match = routeRegex.exec(content)) !== null) {
                backendRoutes.push({
                    method: match[1].toUpperCase(),
                    path: match[2],
                    file: filePath
                });
            }

            // Also app.get/post patterns
            const appRouteRegex = /app\s*\.\s*(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
            while ((match = appRouteRegex.exec(content)) !== null) {
                backendRoutes.push({
                    method: match[1].toUpperCase(),
                    path: match[2],
                    file: filePath
                });
            }
        }
    }

    // Check if frontend calls have matching backend routes
    for (const call of frontendCalls) {
        const normalizedCallPath = call.path.replace(/\/:[^/]+/g, '/:param').replace(/^\/api/, '');
        const hasMatch = backendRoutes.some(route => {
            const normalizedRoutePath = route.path.replace(/\/:[^/]+/g, '/:param');
            return route.method === call.method &&
                (normalizedRoutePath === normalizedCallPath ||
                    normalizedRoutePath === call.path ||
                    call.path.includes(normalizedRoutePath));
        });

        if (!hasMatch && call.path.startsWith('/api')) {
            issues.push({
                type: 'MISSING_BACKEND_ROUTE',
                severity: 'warning',
                file: call.file,
                detail: `Frontend calls ${call.method} ${call.path} but no matching backend route found`,
                method: call.method,
                path: call.path
            });
        }
    }

    return issues;
};

// ── Model Reference Checker ─────────────────────────────────────────
const validateModelReferences = (fileSystem) => {
    const issues = [];
    const definedModels = new Set();

    // Find defined models
    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (!content || typeof content !== 'string') continue;
        if (!filePath.includes('model') && !filePath.includes('Model')) continue;

        // mongoose.model('Name', schema)
        const modelDefRegex = /mongoose\.model\s*\(\s*['"](\w+)['"]/g;
        let match;
        while ((match = modelDefRegex.exec(content)) !== null) {
            definedModels.add(match[1]);
        }

        // export default mongoose.model or module.exports
        const exportModelRegex = /export\s+default\s+mongoose\.model\s*\(\s*['"](\w+)['"]/g;
        while ((match = exportModelRegex.exec(content)) !== null) {
            definedModels.add(match[1]);
        }
    }

    // Find model imports/references in controllers and services
    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (!content || typeof content !== 'string') continue;
        if (!filePath.startsWith('server/')) continue;
        if (filePath.includes('model') || filePath.includes('Model')) continue;

        // import Model from '../models/Model.js'
        const importModelRegex = /import\s+(\w+)\s+from\s+['"][^'"]*models\/([^'"]+)['"]/g;
        let match;
        while ((match = importModelRegex.exec(content)) !== null) {
            const modelName = match[1];
            if (definedModels.size > 0 && !definedModels.has(modelName)) {
                issues.push({
                    type: 'MISSING_MODEL',
                    severity: 'error',
                    file: filePath,
                    detail: `References model "${modelName}" but it is not defined in any model file`,
                    modelName
                });
            }
        }
    }

    return issues;
};

// ── Placeholder / TODO Detector ─────────────────────────────────────
const validateNoPlaceholders = (fileSystem) => {
    const issues = [];
    const placeholderPatterns = [
        { regex: /\/\/\s*TODO/gi, label: 'TODO comment' },
        { regex: /\/\/\s*FIXME/gi, label: 'FIXME comment' },
        { regex: /\/\/\s*HACK/gi, label: 'HACK comment' },
        { regex: /['"]placeholder['"]/gi, label: 'Placeholder string' },
        { regex: /\.\.\.\s*\/\//g, label: 'Ellipsis placeholder' },
        { regex: /throw\s+new\s+Error\s*\(\s*['"]Not implemented['"]/gi, label: 'Not implemented error' },
        { regex: /console\.log\s*\(\s*['"]TODO/gi, label: 'TODO log' }
    ];

    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (!content || typeof content !== 'string') continue;
        if (filePath === 'README.md' || filePath.endsWith('.md')) continue;

        for (const pattern of placeholderPatterns) {
            const matches = content.match(pattern.regex);
            if (matches) {
                issues.push({
                    type: 'PLACEHOLDER_CODE',
                    severity: 'warning',
                    file: filePath,
                    detail: `Contains ${matches.length} ${pattern.label}(s) — code may be incomplete`,
                    count: matches.length
                });
            }
        }
    }

    return issues;
};

// ── Blueprint Enforcement ───────────────────────────────────────────
const validateBlueprintAlignment = (blueprint, fileSystem) => {
    const issues = [];
    if (!blueprint || !blueprint.file_plan) return issues;

    const generatedFiles = new Set(Object.keys(fileSystem));
    const plannedFiles = blueprint.file_plan
        .filter(f => f.operation !== 'delete')
        .map(f => f.file_path);

    // Check for planned files missing from generation
    const missingFiles = [];
    for (const plannedFile of plannedFiles) {
        if (!generatedFiles.has(plannedFile)) {
            missingFiles.push(plannedFile);
            issues.push({
                type: 'MISSING_PLANNED_FILE',
                severity: 'error',
                file: plannedFile,
                detail: `Blueprint planned "${plannedFile}" but it was not generated by Stage 2`,
                plannedFile
            });
        }
    }

    // Check for unexpected extra files (info only, not errors)
    const boilerplateFiles = new Set([
        'README.md', '.gitignore',
        'client/package.json', 'client/vite.config.js', 'client/tailwind.config.js',
        'client/postcss.config.js', 'client/index.html', 'client/src/index.css',
        'client/src/main.jsx', 'server/package.json', 'server/index.js', 'server/.env'
    ]);

    for (const generatedFile of generatedFiles) {
        if (!plannedFiles.includes(generatedFile) && !boilerplateFiles.has(generatedFile)) {
            issues.push({
                type: 'UNPLANNED_FILE',
                severity: 'info',
                file: generatedFile,
                detail: `File "${generatedFile}" was generated but not in the blueprint plan`
            });
        }
    }

    return { issues, missingFiles };
};

// ── MASTER VALIDATION ───────────────────────────────────────────────
export const validateProject = (fileSystem, blueprint = null) => {
    const allIssues = [];

    // Run all validators
    allIssues.push(...validateImports(fileSystem));
    allIssues.push(...validateApiRouteConsistency(fileSystem));
    allIssues.push(...validateModelReferences(fileSystem));
    allIssues.push(...validateNoPlaceholders(fileSystem));

    let missingFiles = [];
    if (blueprint) {
        const blueprintResult = validateBlueprintAlignment(blueprint, fileSystem);
        allIssues.push(...blueprintResult.issues);
        missingFiles = blueprintResult.missingFiles || [];
    }

    // Compute summary
    const errors = allIssues.filter(i => i.severity === 'error');
    const warnings = allIssues.filter(i => i.severity === 'warning');
    const infos = allIssues.filter(i => i.severity === 'info');

    const report = {
        passed: errors.length === 0,
        totalIssues: allIssues.length,
        errors: errors.length,
        warnings: warnings.length,
        infos: infos.length,
        issues: allIssues,
        missingFiles,
        timestamp: new Date().toISOString()
    };

    console.log(`[Validation] Report: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info — ${report.passed ? 'PASSED' : 'FAILED'}`);

    return report;
};

// ── Build context string for Debugger Agent ─────────────────────────
export const buildValidationContext = (report) => {
    if (!report || report.issues.length === 0) return 'No validation issues found.';

    let context = `VALIDATION REPORT (${report.totalIssues} issues found):\n\n`;

    if (report.errors > 0) {
        context += `ERRORS (${report.errors}):\n`;
        for (const issue of report.issues.filter(i => i.severity === 'error')) {
            context += `  - [${issue.type}] ${issue.file}: ${issue.detail}\n`;
        }
        context += '\n';
    }

    if (report.warnings > 0) {
        context += `WARNINGS (${report.warnings}):\n`;
        for (const issue of report.issues.filter(i => i.severity === 'warning')) {
            context += `  - [${issue.type}] ${issue.file}: ${issue.detail}\n`;
        }
        context += '\n';
    }

    return context;
};
