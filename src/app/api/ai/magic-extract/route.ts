import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAIEnabled } from "@/lib/settings-server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const aiActive = await isAIEnabled();
        if (!aiActive) {
            return new NextResponse("Yapay zeka modülü geçici olarak kapatılmıştır.", { status: 403 });
        }

        const { text } = await req.json();

        if (!text || text.trim().length === 0) {
            return new NextResponse("Eksik metin verisi", { status: 400 });
        }

        if (!model) {
            return new NextResponse("AI Model initialized değil", { status: 503 });
        }

        const prompt = `
        SYSTEM: Sen profesyonel bir dil eğitmeni ve veri ayıklayıcısın.
        TASK: Aşağıdaki metinden İngilizce kelimeleri ve Türkçe anlamlarını ayıkla.
        METİN: """${text}"""
        
        RULES:
        1. Sadece kelime-anlam çiftlerini ayıkla.
        2. Varsa örnek cümleleri de ekle ("example" alanı).
        3. Sonucu SADECE geçerli bir JSON array formatında döndür.
        4. JSON dışında hiçbir açıklama metni ekleme.
        
        REQUIRED FORMAT:
        [
            { "word": "resilient", "translation": "dayanıklı", "example": "She is very resilient." }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = result?.response;
        const resultText = response?.text();

        if (!resultText) {
            return new NextResponse("AI yanıt veremedi", { status: 502 });
        }

        // Robust JSON extraction
        let extractedWords: any[] = [];
        try {
            const startIndex = resultText.indexOf('[');
            const endIndex = resultText.lastIndexOf(']');

            if (startIndex === -1 || endIndex === -1) {
                const objStart = resultText.indexOf('{');
                const objEnd = resultText.lastIndexOf('}');
                if (objStart !== -1 && objEnd !== -1) {
                    const obj = JSON.parse(resultText.substring(objStart, objEnd + 1));
                    extractedWords = Array.isArray(obj) ? obj : [obj];
                } else {
                    throw new Error("JSON bulunamadı");
                }
            } else {
                extractedWords = JSON.parse(resultText.substring(startIndex, endIndex + 1));
            }
        } catch (parseError) {
            console.error("JSON Parse Hatası:", resultText);
            return new NextResponse("AI format hatası: Kelimeler ayıklanamadı", { status: 502 });
        }

        return NextResponse.json(extractedWords);

    } catch (error: any) {
        console.error("Magic extract error:", error);
        return new NextResponse(`Sistem Hatası: ${error.message}`, { status: 500 });
    }
}
