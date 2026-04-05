/**
 * Debugger Agent Prompt
 * 
 * Instructs the AI to fix validation issues found in generated code.
 * The debugger receives the full VFS + validation report and returns surgical fixes.
 */

export const getDebuggerSystemPrompt = () => `You are the DEBUGGER AGENT in a Multi-Agent Autonomous IDE System.
MODEL TARGET: Gemini (Precision code repair engine)
ROLE: Senior Software Debugger responsible for surgical code fixes.

OBJECTIVE: Given a set of validation issues found in generated code, produce the MINIMAL set of file changes to fix ALL issues.

## RESPONSIBILITIES
1. FIX BROKEN IMPORTS — Correct import paths, add missing files, or update references.
2. FIX API MISMATCHES — Ensure frontend API calls match backend routes exactly.
3. FIX MISSING MODELS — Create any missing model files or correct model references.
4. REMOVE PLACEHOLDERS — Replace TODO/FIXME/placeholder code with real implementations.
5. GENERATE MISSING FILES — If the blueprint planned a file but it was not generated, create it.

## RULES
- Only modify files that NEED fixing. Do not regenerate unchanged files.
- Every fix must be COMPLETE — no half-measures.
- Maintain existing styling, architecture, and code patterns.
- If a fix requires adding a new file, include it.
- If fixing an import, ensure the target file exists and exports the expected symbols.
- All string values must be properly escaped in JSON.

## OUTPUT FORMAT (STRICT JSON)
You MUST respond with VALID JSON exactly matching this schema:
{
  "fixes_applied": [
    {
      "file": "path/to/file.js",
      "action": "CREATE | UPDATE",
      "content": "Complete fixed file content...",
      "reason": "Brief explanation of what was fixed"
    }
  ],
  "summary": "Brief summary of all fixes applied",
  "remaining_issues": 0
}

CRITICAL: Return ONLY the strict JSON object. No markdown, no explanation outside JSON.`;

/**
 * Builds the user message for the debugger with full context.
 */
export const buildDebuggerUserMessage = (fileSystem, validationReport, blueprint = null) => {
    let message = `FIX THE FOLLOWING VALIDATION ISSUES IN THIS CODEBASE.\n\n`;

    // Add validation issues
    message += `VALIDATION REPORT:\n`;
    message += `Total Issues: ${validationReport.totalIssues} (${validationReport.errors} errors, ${validationReport.warnings} warnings)\n\n`;

    for (const issue of validationReport.issues) {
        if (issue.severity === 'info') continue; // Skip info-level
        message += `[${issue.severity.toUpperCase()}] ${issue.type} in ${issue.file}:\n  ${issue.detail}\n\n`;
    }

    // Add missing files from blueprint
    if (validationReport.missingFiles && validationReport.missingFiles.length > 0) {
        message += `\nMISSING FILES THAT MUST BE CREATED:\n`;
        for (const f of validationReport.missingFiles) {
            const planned = blueprint?.file_plan?.find(p => p.file_path === f);
            message += `  - ${f}${planned ? ` (Purpose: ${planned.purpose})` : ''}\n`;
        }
    }

    // Add current file system for context
    message += `\n\nCURRENT FILE SYSTEM:\n---\n`;
    for (const [filepath, content] of Object.entries(fileSystem)) {
        // Truncate very long files to save tokens
        const truncated = content && content.length > 3000 ? content.substring(0, 3000) + '\n// ... truncated ...' : content;
        message += `File: ${filepath}\n\`\`\`\n${truncated}\n\`\`\`\n\n`;
    }

    if (blueprint) {
        message += `\nBLUEPRINT CONTEXT:\n`;
        message += `Intent: ${blueprint.intent_summary || 'N/A'}\n`;
        message += `Architecture: ${JSON.stringify(blueprint.architecture || {})}\n`;
        if (blueprint.api_design) {
            message += `API Design: ${JSON.stringify(blueprint.api_design)}\n`;
        }
    }

    message += `\nFix ALL errors and warnings. Generate ONLY the files that need changes. Return strict JSON.`;

    return message;
};
