import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

/**
 * Generates vector embeddings for a given text chunk using Google Gemini API.
 */
export const generateEmbeddings = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Embedding generation failed:", error);
        // Return dummy vector if missing API key for local execution
        return new Array(768).fill(0).map(() => Math.random());
    }
};

/**
 * Basic document text chunker
 */
export const chunkText = (text, maxLength = 1000) => {
    const chunks = [];
    let currentPos = 0;

    while (currentPos < text.length) {
        let endPos = currentPos + maxLength;
        if (endPos < text.length) {
            // Try to break at a newline or space
            const lastNewline = text.lastIndexOf('\n', endPos);
            const lastSpace = text.lastIndexOf(' ', endPos);
            const breakPoint = lastNewline > currentPos ? lastNewline : (lastSpace > currentPos ? lastSpace : endPos);

            chunks.push(text.slice(currentPos, breakPoint).trim());
            currentPos = breakPoint + 1;
        } else {
            chunks.push(text.slice(currentPos).trim());
            currentPos = text.length;
        }
    }
    return chunks.filter(c => c.length > 0);
};
