import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserPlanInfo, incrementAIUsage } from '@/lib/subscription-server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 🔒 Check plan: Story mode is PRO only
        const planInfo = await getUserPlanInfo(session.user.id);
        if (!planInfo || !planInfo.limits.hasStoryMode) {
            return NextResponse.json({
                error: 'Hikaye modu yalnızca Pro plan ile kullanılabilir.',
                code: 'PLAN_REQUIRED',
                requiredPlan: 'PRO',
                plan: planInfo?.plan || 'FREE',
            }, { status: 403 });
        }

        // 🔒 Check AI limit
        if (planInfo.aiLimitReached) {
            return NextResponse.json({
                error: `Günlük AI limitine ulaştınız. Planınızı yükseltin.`,
                code: 'AI_LIMIT_REACHED',
                plan: planInfo.plan,
            }, { status: 403 });
        }

        const { level = 'A2', wordCount = 10 } = await request.json();

        // Get user's words for story generation
        const userListItems = await prisma.wordListItem.findMany({
            where: {
                wordList: { userId: session.user.id }
            },
            include: { word: true },
            take: wordCount,
        });

        if (userListItems.length < 3) {
            return NextResponse.json(
                { error: 'Hikaye oluşturmak için en az 3 kelime gerekli' },
                { status: 400 }
            );
        }

        const words = userListItems.map(item => ({
            word: item.word.word,
            translation: item.word.turkishTranslation,
        }));

        const wordList = words.map(w => w.word).join(', ');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a language learning assistant. Create a short, engaging story in English for a ${level} level learner.

The story MUST include these words naturally: ${wordList}

Requirements:
1. Story should be 100-150 words long
2. Use simple sentences appropriate for ${level} level
3. Make it interesting and memorable
4. Wrap each target vocabulary word with ** markers (e.g., **hello**)
5. Return ONLY the story text, nothing else

Target words to include:
${wordList}`;

        const result = await model.generateContent(prompt);
        const story = result.response.text();

        // Parse story to identify target words
        const wordsInStory = words.map(w => ({
            word: w.word,
            translation: w.translation,
            found: story.toLowerCase().includes(w.word.toLowerCase()),
        }));

        // Track AI usage
        await incrementAIUsage(session.user.id);

        return NextResponse.json({
            story,
            words: wordsInStory,
            level,
        });
    } catch (error) {
        console.error('Story generation error:', error);
        return NextResponse.json(
            { error: 'Hikaye oluşturulamadı' },
            { status: 500 }
        );
    }
}
