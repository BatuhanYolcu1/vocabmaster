import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use gemini-1.5-flash for broader compatibility
export const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AIResponse {
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
    turkishTranslation: string;
    type: string;
    pronunciation?: string;
    mnemonic?: string;
    synonyms?: string[];
    collocations?: string[];
}

// Simple in-memory cache to avoid redundant API calls
const wordCache = new Map<string, AIResponse>();

export async function generateWordDetails(word: string): Promise<AIResponse> {
    // Check cache first
    const cacheKey = word.toLowerCase().trim();
    const cached = wordCache.get(cacheKey);
    if (cached) return cached;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY tanımlı değil");
    }

    if (!model) {
        throw new Error("Gemini model başlatılamadı");
    }

    const prompt = `
    Analyze the English word "${word}" and provide the following details in JSON format:
    1. turkishTranslation: Common Turkish meaning (concise, 2-4 words max)
    2. definitionTr: Short Turkish definition (1-2 sentences)
    3. exampleSentence: A simple, natural English example sentence
    4. exampleSentenceTr: Turkish translation of the example sentence
    5. type: Word type (noun, verb, adjective, adverb, preposition)
    6. pronunciation: IPA phonetic transcription (e.g. /rɪˈzɪl.i.ənt/)
    7. mnemonic: A creative memory trick in Turkish to remember this word (1 sentence, fun and memorable)
    8. synonyms: Array of 2-3 English synonyms
    9. collocations: Array of 2-3 common English collocations/phrases using this word

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
        const parsed = JSON.parse(cleanText) as AIResponse;
        // Cache the result
        wordCache.set(cacheKey, parsed);
        return parsed;
    } catch {
        console.error("Failed to parse Gemini response:", cleanText);
        throw new Error("Gemini yanıtı ayrıştırılamadı");
    }
}

// Generate a short story using given words
export async function generateStory(words: string[]): Promise<{ story: string; storyTr: string; highlightedWords: string[] }> {
    if (!apiKey || !model) {
        throw new Error("Gemini API kullanılamıyor");
    }

    const prompt = `
    Create a very short story (4-6 sentences) in English that naturally uses ALL of these words: ${words.join(', ')}.
    The story should be engaging and at B1-B2 level.

    Return JSON:
    {
        "story": "The English story here...",
        "storyTr": "Hikayenin Türkçe çevirisi...",
        "highlightedWords": ["word1", "word2"] // the exact words from the story that match the input list
    }

    Return ONLY the JSON object, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(cleanText);
    } catch {
        throw new Error("Story yanıtı ayrıştırılamadı");
    }
}
