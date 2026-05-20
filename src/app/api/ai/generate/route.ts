import { NextRequest, NextResponse } from 'next/server';
import { generateWordDetails } from '@/lib/gemini';
import { auth } from '@/lib/auth';
import { getUserPlanInfo, incrementAIUsage } from '@/lib/subscription-server';
import { isAIEnabled } from '@/lib/settings-server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const aiActive = await isAIEnabled();
        if (!aiActive) {
            return NextResponse.json({ error: 'Yapay zeka modülü geçici olarak kapatılmıştır.' }, { status: 403 });
        }

        // 🔒 Check AI usage limit
        const planInfo = await getUserPlanInfo(session.user.id);
        if (planInfo?.aiLimitReached) {
            return NextResponse.json({
                error: `Günlük AI kullanım limitine ulaştınız (${planInfo.aiUsageCount}/${planInfo.limits.dailyAILimit}). Planınızı yükseltin.`,
                code: 'AI_LIMIT_REACHED',
                plan: planInfo.plan,
            }, { status: 403 });
        }

        const { word } = await request.json();

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: 'AI servisi yapılandırılmamış - GEMINI_API_KEY eksik',
            }, { status: 503 });
        }

        const details = await generateWordDetails(word);
        
        // Track AI usage
        await incrementAIUsage(session.user.id);
        
        return NextResponse.json(details);
    } catch (error) {
        console.error('AI API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
