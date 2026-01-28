import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return new NextResponse("Missing image data", { status: 400 });
        }

        // Extract base64 content
        const base64Data = image.split(",")[1] || image;

        const prompt = `
        Look at this image of a word list or book page. 
        Extract the English words and their Turkish translations.
        
        Rules:
        1. Identify the English word (word) and its Turkish translation (translation).
        2. If there is an example sentence, include it (example).
        3. Return ONLY a structured JSON array of objects.
        
        Expected Format:
        [
            { "word": "apple", "translation": "elma", "example": "I ate an apple." },
            ...
        ]
        
        Return ONLY the JSON. No markdown formatting.
        `;

        // Using Gemini 1.5 Flash for vision
        const result = await model?.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = result?.response;
        const text = response?.text();

        if (!text) {
            throw new Error("Gemini returned empty response");
        }

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const extractedWords = JSON.parse(cleanText);

        return NextResponse.json(extractedWords);

    } catch (error) {
        console.error("Image extraction error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
