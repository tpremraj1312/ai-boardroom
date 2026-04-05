/**
 * DEBUGGER AGENT SERVICE (Stage 4)
 * 
 * Automated post-generation validation and repair pipeline.
 * 
 * Flow:
 * 1. Run validation on generated fileSystem
 * 2. If errors found → invoke AI debugger to fix them
 * 3. Apply fixes to fileSystem
 * 4. Re-validate to confirm fixes
 * 5. Return patched fileSystem + report
 * 
 * Max retry: 2 debug cycles to prevent infinite loops.
 */

import { generateAgentResponse } from './aiService.js';
import { validateProject, buildValidationContext } from './validationService.js';
import { getDebuggerSystemPrompt, buildDebuggerUserMessage } from './prompts/debuggerPrompt.js';

const MAX_DEBUG_CYCLES = 2;

/**
 * Main debugger pipeline. Returns { fileSystem, validationReport, debugLog }.
 */
export const runDebuggerAgent = async (fileSystem, blueprint = null) => {
    const debugLog = [];
    let currentFS = { ...fileSystem };
    let cycle = 0;
    let finalReport = null;

    console.log('[Debugger] Starting automated validation & debug cycle...');

    while (cycle < MAX_DEBUG_CYCLES) {
        cycle++;
        console.log(`[Debugger] Cycle ${cycle}/${MAX_DEBUG_CYCLES} — Running validation...`);

        // Step 1: Validate
        const report = validateProject(currentFS, blueprint);
        finalReport = report;

        debugLog.push({
            cycle,
            phase: 'validation',
            errors: report.errors,
            warnings: report.warnings,
            passed: report.passed,
            timestamp: new Date().toISOString()
        });

        // If no errors, we're done
        if (report.errors === 0 && report.warnings === 0) {
            console.log(`[Debugger] Cycle ${cycle} — All clear! No issues found.`);
            break;
        }

        console.log(`[Debugger] Cycle ${cycle} — Found ${report.errors} errors, ${report.warnings} warnings. Invoking AI debugger...`);

        // Step 2: Invoke AI debugger
        try {
            const systemPrompt = getDebuggerSystemPrompt();
            const userMessage = buildDebuggerUserMessage(currentFS, report, blueprint);

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

            const debugResult = JSON.parse(cleaned);

            // Step 3: Apply fixes
            if (debugResult.fixes_applied && Array.isArray(debugResult.fixes_applied)) {
                let fixCount = 0;
                for (const fix of debugResult.fixes_applied) {
                    if (fix.file && fix.content && (fix.action === 'CREATE' || fix.action === 'UPDATE')) {
                        currentFS[fix.file] = fix.content;
                        fixCount++;
                        console.log(`[Debugger] Fixed: ${fix.file} — ${fix.reason || 'auto-fix'}`);
                    }
                }

                debugLog.push({
                    cycle,
                    phase: 'fix',
                    fixesApplied: fixCount,
                    summary: debugResult.summary || `Applied ${fixCount} fixes`,
                    timestamp: new Date().toISOString()
                });

                console.log(`[Debugger] Cycle ${cycle} — Applied ${fixCount} fixes.`);
            } else {
                console.log(`[Debugger] Cycle ${cycle} — AI returned no fixes.`);
                break;
            }

        } catch (error) {
            console.error(`[Debugger] Cycle ${cycle} — AI debugger failed:`, error.message);
            debugLog.push({
                cycle,
                phase: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            break; // Don't retry on AI failure
        }
    }

    // Final validation pass
    if (cycle > 0) {
        finalReport = validateProject(currentFS, blueprint);
        debugLog.push({
            cycle: 'final',
            phase: 'validation',
            errors: finalReport.errors,
            warnings: finalReport.warnings,
            passed: finalReport.passed,
            timestamp: new Date().toISOString()
        });
    }

    console.log(`[Debugger] Complete. Final result: ${finalReport.passed ? 'PASSED' : 'ISSUES REMAIN'} (${finalReport.errors} errors, ${finalReport.warnings} warnings)`);

    return {
        fileSystem: currentFS,
        validationReport: finalReport,
        debugLog,
        debugCycles: cycle
    };
};
