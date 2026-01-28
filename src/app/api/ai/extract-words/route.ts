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

        // Using Gemini 1.5 Flash for vision
        const result = await model?.generateContent([
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

        console.log("Gemini Raw Response:", text);

        // More robust JSON extraction
        let extractedWords: any[] = [];
        try {
            // Find the first [ and last ] to extract the JSON array
            const startIndex = text.indexOf('[');
            const endIndex = text.lastIndexOf(']');

            if (startIndex === -1 || endIndex === -1) {
                // Try object format if array fails (though we asked for array)
                const objStart = text.indexOf('{');
                const objEnd = text.lastIndexOf('}');
                if (objStart !== -1 && objEnd !== -1) {
                    const objText = text.substring(objStart, objEnd + 1);
                    const obj = JSON.parse(objText);
                    extractedWords = Array.isArray(obj) ? obj : [obj];
                } else {
                    throw new Error("No JSON found in response");
                }
            } else {
                const jsonText = text.substring(startIndex, endIndex + 1);
                extractedWords = JSON.parse(jsonText);
            }
        } catch (parseError) {
            console.error("JSON Parsing failed:", parseError, "Raw text:", text);
            return new NextResponse("AI format error: Could not parse word list", { status: 502 });
        }

        return NextResponse.json(extractedWords);

    } catch (error) {
        console.error("Image extraction error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
