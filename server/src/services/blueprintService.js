import { generateGrokResponse } from './aiService.js';
import { getBlueprintSystemPrompt, buildBlueprintUserMessage } from './prompts/blueprintPrompt.js';

/**
 * Generates a structured JSON blueprint (Stage 1 Plan) from a user's app description.
 * This is Step 1 of the 2-step AI pipeline (Grok Engine).
 */
export const generateBlueprint = async (prompt, theme = 'modern') => {
    const systemPrompt = getBlueprintSystemPrompt(theme);
    const userMessage = buildBlueprintUserMessage(prompt);

    const rawResponse = await generateGrokResponse({
        systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        requireJson: true
    });

    // Clean and parse the response
    const cleaned = rawResponse
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

    try {
        const blueprint = JSON.parse(cleaned);
        
        // Validate essential Stage 1 blueprint structure
        if (!blueprint.intent_summary || !blueprint.architecture || !Array.isArray(blueprint.file_plan)) {
            throw new Error('Blueprint missing required STAGE 1 sections (intent_summary, architecture, file_plan)');
        }

        return blueprint;
    } catch (parseError) {
        console.error('[BlueprintService] Failed to parse blueprint JSON:', parseError.message);
        console.error('[BlueprintService] Raw response (first 500 chars):', cleaned.substring(0, 500));
        throw new Error('AI failed to generate a valid Stage 1 plan. Please try rephrasing your prompt.');
    }
};
