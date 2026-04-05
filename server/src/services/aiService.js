import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Generates an agent response using Google Gemini API.
 * Supports streaming, JSON mode with graceful fallback.
 */
export const generateAgentResponse = async ({ systemPrompt, messages, onChunk, requireJson = false }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('AI service not configured. Missing GEMINI_API_KEY in server .env');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    const modelName = process.env.AI_MODEL || 'gemini-2.0-flash';
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 8192;
    const temp = parseFloat(process.env.AI_TEMPERATURE) || 0.1;

    console.log(`[AI Service] Using model: ${modelName}, maxTokens: ${maxTokens}, requireJson: ${requireJson}`);

    const modelParams = {
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: temp
        }
    };

    // Try JSON mode if requested
    if (requireJson) {
        modelParams.generationConfig.responseMimeType = "application/json";
    }

    const formattedMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    let chatParams = {};
    let lastMessageText = "";

    if (formattedMessages.length > 1) {
        chatParams.history = formattedMessages.slice(0, -1);
        lastMessageText = formattedMessages[formattedMessages.length - 1].parts[0].text;
    } else if (formattedMessages.length === 1) {
        lastMessageText = formattedMessages[0].parts[0].text;
    } else {
        lastMessageText = "Please begin.";
    }

    // Attempt 1: With JSON mode (if requireJson)
    try {
        const model = genAI.getGenerativeModel(modelParams);
        const chat = model.startChat(chatParams);
        const result = await chat.sendMessageStream(lastMessageText);

        let fullText = '';
        for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            if (onChunk) onChunk(text);
        }

        console.log(`[AI Service] Generation successful. Response length: ${fullText.length} chars`);
        return fullText;
    } catch (error) {
        console.error(`[AI Service] Attempt 1 failed: ${error.message}`);

        // If JSON mode caused the failure, retry WITHOUT responseMimeType
        if (requireJson && error.message.includes('responseMimeType')) {
            console.log('[AI Service] Retrying without responseMimeType...');
            delete modelParams.generationConfig.responseMimeType;

            try {
                const model = genAI.getGenerativeModel(modelParams);
                const chat = model.startChat(chatParams);
                const result = await chat.sendMessageStream(lastMessageText);

                let fullText = '';
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    fullText += text;
                    if (onChunk) onChunk(text);
                }

                console.log(`[AI Service] Retry successful. Response length: ${fullText.length} chars`);
                return fullText;
            } catch (retryError) {
                console.error(`[AI Service] Retry also failed: ${retryError.message}`);
                throw new Error(`Gemini AI generation failed: ${retryError.message}`);
            }
        }

        throw new Error(`Gemini AI generation failed: ${error.message}`);
    }
};

/**
 * Generates an architectural response using the Grok API mapping via xAI.
 * Used exclusively for STAGE 1 Planning Engine.
 */
export const generateGrokResponse = async ({ systemPrompt, messages, requireJson = false }) => {
    if (!process.env.XAI_API_KEY) {
        console.warn('XAI_API_KEY missing in .env, falling back to Gemini for Planning phase...');
        return generateAgentResponse({ systemPrompt, messages, requireJson });
    }

    try {
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const payload = {
            model: "grok-beta",
            messages: formattedMessages,
            temperature: 0.2
        };

        if (requireJson) {
            payload.response_format = { type: "json_object" };
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`xAI API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.choices && data.choices[0]?.message?.content ? data.choices[0].message.content : '';
    } catch (error) {
        console.error('[AI Service] Grok API Error:', error.message);
        throw new Error(`Grok Architecture generation failed: ${error.message}`);
    }
};
