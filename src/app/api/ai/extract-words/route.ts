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

        // Extract base64 content and mime type
        const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");

        const prompt = `
        SYSTEM: You are a professional translator and OCR specialist.
        TASK: Extract English-Turkish word pairs from the provided image.
        FORMAT: Return ONLY a valid JSON array. Do not include any text before or after the JSON.
        
        Fields:
        - "word": The English word or phrase.
        - "translation": The Turkish translation.
        - "example": Short example sentence if visible, otherwise omit.
        
        REQUIRED JSON FORMAT:
        [
            { "word": "example", "translation": "örnek", "example": "This is an example." }
        ]
        `;

        // Check if model is available
        if (!model) {
            console.error("Gemini model not initialized - check GEMINI_API_KEY");
            return new NextResponse("AI Model not initialized. Please check your GEMINI_API_KEY in Vercel settings.", { status: 503 });
        }

        // Using Gemini 1.5 Flash for vision
        console.log("Calling Gemini Vision with mimeType:", mimeType);
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = result?.response;
        const text = response?.text();

        if (!text) {
            console.error("Gemini returned empty response");
            return new NextResponse("Gemini response was empty", { status: 502 });
        }

        console.log("Gemini Raw Response Length:", text.length);

        // More robust JSON extraction
        let extractedWords: any[] = [];
        try {
            const startIndex = text.indexOf('[');
            const endIndex = text.lastIndexOf(']');

            if (startIndex === -1 || endIndex === -1) {
                const objStart = text.indexOf('{');
                const objEnd = text.lastIndexOf('}');
                if (objStart !== -1 && objEnd !== -1) {
                    const objText = text.substring(objStart, objEnd + 1);
                    const obj = JSON.parse(objText);
                    extractedWords = Array.isArray(obj) ? obj : [obj];
                } else {
                    throw new Error("No JSON found in AI response.");
                }
            } else {
                const jsonText = text.substring(startIndex, endIndex + 1);
                extractedWords = JSON.parse(jsonText);
            }
        } catch (parseError: any) {
            console.error("JSON Parsing failed:", parseError);
            return new NextResponse(`AI format error: ${parseError.message}`, { status: 502 });
        }

        return NextResponse.json(extractedWords);

    } catch (error: any) {
        console.error("Image extraction error:", error);
        return new NextResponse(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 });
    }
}
