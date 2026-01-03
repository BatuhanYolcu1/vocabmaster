import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AIResponse {
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
    turkishTranslation: string;
    type: string;
}

export async function generateWordDetails(word: string): Promise<AIResponse> {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY tanımlı değil");
    }

    if (!model) {
        throw new Error("Gemini model başlatılamadı");
    }

    const prompt = `
    Analyze the English word "${word}" and provide the following details in JSON format:
    1. turkishTranslation: Common Turkish meaning
    2. definitionTr: Short Turkish definition
    3. exampleSentence: A simple English example sentence
    4. exampleSentenceTr: Turkish translation of the example sentence
    5. type: Word type (noun, verb, adjective, adverb)

    Return ONLY the JSON object, no markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
        throw new Error("Gemini boş yanıt döndü");
    }

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(cleanText) as AIResponse;
    } catch {
        console.error("Failed to parse Gemini response:", cleanText);
        throw new Error("Gemini yanıtı ayrıştırılamadı");
    }
}


