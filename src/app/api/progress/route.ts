import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// SRS calculation based on rating
function calculateNextReview(rating: string, currentInterval: number, currentEase: number) {
    let newInterval: number;
    let newEaseFactor = currentEase;

    switch (rating) {
        case 'hard':
            newInterval = 1; // 1 minute
            newEaseFactor = Math.max(1.3, currentEase - 0.2);
            break;
        case 'good':
            newInterval = Math.round(currentInterval * currentEase);
            if (newInterval < 1440) newInterval = 1440; // Minimum 1 day
            break;
        case 'easy':
            newInterval = Math.round(currentInterval * currentEase * 1.3);
            if (newInterval < 5760) newInterval = 5760; // Minimum 4 days
            newEaseFactor = Math.min(3.0, currentEase + 0.1);
            break;
        default:
            newInterval = currentInterval;
    }

    const nextReview = new Date();
    nextReview.setMinutes(nextReview.getMinutes() + newInterval);

    return { newInterval, newEaseFactor, nextReview };
}

// POST /api/progress - Update word progress after practice
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { wordId, rating, isCorrect } = body;

        if (!wordId || !rating) {
            return NextResponse.json({ error: 'wordId and rating required' }, { status: 400 });
        }

        // Get or create progress record
        let progress = await prisma.progress.findUnique({
            where: {
                userId_wordId: {
                    userId: session.user.id,
                    wordId: wordId
                }
            }
        });

        if (!progress) {
            // Create new progress record
            progress = await prisma.progress.create({
                data: {
                    userId: session.user.id,
                    wordId: wordId,
                    interval: 1,
                    easeFactor: 2.5,
                    nextReview: new Date(),
                    reviewCount: 0,
                    correctCount: 0,
                    wrongCount: 0
                }
            });
        }

        // Calculate new SRS values
        const { newInterval, newEaseFactor, nextReview } = calculateNextReview(
            rating,
            progress.interval,
            progress.easeFactor
        );

        // Update progress
        const updatedProgress = await prisma.progress.update({
            where: { id: progress.id },
            data: {
                interval: newInterval,
                easeFactor: newEaseFactor,
                nextReview: nextReview,
                reviewCount: progress.reviewCount + 1,
                correctCount: isCorrect ? progress.correctCount + 1 : progress.correctCount,
                wrongCount: isCorrect === false ? progress.wrongCount + 1 : progress.wrongCount,
                lastRating: rating
            }
        });

        return NextResponse.json({
            success: true,
            progress: {
                interval: updatedProgress.interval,
                nextReview: updatedProgress.nextReview,
                reviewCount: updatedProgress.reviewCount,
                correctCount: updatedProgress.correctCount,
                wrongCount: updatedProgress.wrongCount
            }
        });
    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}

// GET /api/progress - Get user's progress summary
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Get words due for review
        const dueForReview = await prisma.progress.count({
            where: {
                userId: session.user.id,
                nextReview: { lte: now }
            }
        });

        // Get total words studied
        const totalStudied = await prisma.progress.count({
            where: { userId: session.user.id }
        });

        // Get words with high accuracy (>70% correct)
        const progressRecords = await prisma.progress.findMany({
            where: { userId: session.user.id }
        });

        const mastered = progressRecords.filter(p => {
            const total = p.correctCount + p.wrongCount;
            return total >= 3 && (p.correctCount / total) >= 0.7;
        }).length;

        const learning = totalStudied - mastered;

        // Get weakest words (lowest accuracy)
        const weakWords = await prisma.progress.findMany({
            where: {
                userId: session.user.id,
                wrongCount: { gt: 0 }
            },
            orderBy: {
                wrongCount: 'desc'
            },
            take: 5,
            include: {
                word: {
                    select: {
                        word: true,
                        turkishTranslation: true
                    }
                }
            }
        });

        return NextResponse.json({
            dueForReview,
            totalStudied,
            mastered,
            learning,
            weakWords: weakWords.map(w => ({
                word: w.word.word,
                translation: w.word.turkishTranslation,
                correctCount: w.correctCount,
                wrongCount: w.wrongCount,
                accuracy: w.correctCount + w.wrongCount > 0
                    ? Math.round((w.correctCount / (w.correctCount + w.wrongCount)) * 100)
                    : 0
            }))
        });
    } catch (error) {
        console.error('Progress fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}
