import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { word, transcript } = await req.json();

        if (!word || !transcript) {
            return new NextResponse("Missing word or transcript", { status: 400 });
        }

        const prompt = `
        Evaluate the student's English pronunciation accuracy based on the provided target word/phrase and the captured transcript.
        
        Target Word: "${word}"
        Captured Transcript: "${transcript}"
        
        Compare the transcript with the target word. Consider homophones and common speech-to-text conversion errors.
        Provide the response ONLY in JSON format:
        {
            "score": number (0-100),
            "feedback": "Short feedback in Turkish about the pronunciation",
            "isCorrect": boolean (true if score > 75)
        }
        `;

        const result = await model?.generateContent(prompt);
        const response = result?.response;
        const text = response?.text();

        if (!text) {
            throw new Error("Gemini returned empty response");
        }

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const evaluation = JSON.parse(cleanText);

        return NextResponse.json(evaluation);

    } catch (error) {
        console.error("Voice evaluation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
