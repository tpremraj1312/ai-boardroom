import { generateAgentResponse } from './aiService.js';
import { getBlueprintSystemPrompt, buildBlueprintUserMessage } from './prompts/blueprintPrompt.js';

/**
 * Generates a structured JSON blueprint from a user's app description.
 * This is Step 1 of the 2-step AI pipeline.
 */
export const generateBlueprint = async (prompt, theme = 'modern') => {
    const systemPrompt = getBlueprintSystemPrompt(theme);
    const userMessage = buildBlueprintUserMessage(prompt);

    const rawResponse = await generateAgentResponse({
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
        
        // Validate essential blueprint structure
        if (!blueprint.name || !blueprint.frontend || !blueprint.backend) {
            throw new Error('Blueprint missing required sections (name, frontend, backend)');
        }

        return blueprint;
    } catch (parseError) {
        console.error('[BlueprintService] Failed to parse blueprint JSON:', parseError.message);
        console.error('[BlueprintService] Raw response (first 500 chars):', cleaned.substring(0, 500));
        throw new Error('AI failed to generate a valid blueprint. Please try rephrasing your prompt.');
    }
};
