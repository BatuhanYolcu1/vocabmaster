import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch detailed word info with progress
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const word = await prisma.word.findUnique({
            where: { id },
            include: {
                progress: {
                    where: { userId: session.user.id },
                    select: {
                        interval: true,
                        easeFactor: true,
                        nextReview: true,
                        reviewCount: true,
                        correctCount: true,
                        wrongCount: true,
                        lastRating: true,
                        updatedAt: true,
                    }
                },
                wordListItems: {
                    where: {
                        wordList: { userId: session.user.id }
                    },
                    include: {
                        wordList: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        if (!word) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 });
        }

        const progress = word.progress[0] || null;
        const totalAttempts = progress ? progress.correctCount + progress.wrongCount : 0;
        const accuracy = totalAttempts > 0 ? Math.round((progress!.correctCount / totalAttempts) * 100) : 0;

        const mastery = progress ? (
            progress.interval >= 1440 ? 'Ustalaşmış' :
                progress.interval >= 60 ? 'İlerliyor' :
                    progress.reviewCount > 0 ? 'Öğreniliyor' : 'Yeni'
        ) : 'Yeni';

        return NextResponse.json({
            id: word.id,
            word: word.word,
            turkishTranslation: word.turkishTranslation,
            definitionTr: word.definitionTr,
            exampleSentence: word.exampleSentence,
            exampleSentenceTr: word.exampleSentenceTr,
            type: word.type,
            level: word.level,
            category: word.category,
            lists: word.wordListItems.map(item => ({
                id: item.wordList.id,
                name: item.wordList.name
            })),
            progress: progress ? {
                reviewCount: progress.reviewCount,
                correctCount: progress.correctCount,
                wrongCount: progress.wrongCount,
                accuracy,
                mastery,
                lastRating: progress.lastRating,
                nextReview: progress.nextReview,
                lastStudied: progress.updatedAt,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching word detail:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
