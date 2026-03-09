import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Generates an agent response using Google Gemini API.
 * Supports streaming chunks back to the client.
 */
export const generateAgentResponse = async ({ systemPrompt, messages, onChunk, requireJson = false }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('AI service not configured. Missing GEMINI_API_KEY in server .env');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    const modelParams = {
        model: process.env.AI_MODEL || 'gemini-2.5-flash',
        systemInstruction: systemPrompt
    };

    if (requireJson) {
        modelParams.generationConfig = { responseMimeType: "application/json" };
    }

    const model = genAI.getGenerativeModel(modelParams);

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

    try {
        const chat = model.startChat(chatParams);
        const result = await chat.sendMessageStream(lastMessageText);

        let fullText = '';
        for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            if (onChunk) onChunk(text);
        }

        return fullText;
    } catch (error) {
        console.error('[AI Service] Gemini API Error:', error.message);
        throw new Error(`AI generation failed: ${error.message}`);
    }
};
