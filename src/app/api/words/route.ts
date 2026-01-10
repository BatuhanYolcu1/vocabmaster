import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/words - Get words with SRS-based smart selection
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const listId = searchParams.get('listId');
        const mode = searchParams.get('mode') || 'smart'; // 'smart', 'random', 'new'

        let wordIds: string[] = [];

        if (listId) {
            // Get words from a specific list - verify list belongs to user
            const wordList = await prisma.wordList.findFirst({
                where: {
                    id: listId,
                    userId: session.user.id
                }
            });

            if (!wordList) {
                return NextResponse.json({ error: 'List not found' }, { status: 404 });
            }

            const listItems = await prisma.wordListItem.findMany({
                where: { wordListId: listId },
                select: { wordId: true },
            });
            wordIds = listItems.map(item => item.wordId);
        } else {
            // Get words from user's lists only
            const userListItems = await prisma.wordListItem.findMany({
                where: {
                    wordList: { userId: session.user.id }
                },
                select: { wordId: true },
            });
            wordIds = userListItems.map(item => item.wordId);
        }

        if (wordIds.length === 0) {
            return NextResponse.json([]);
        }

        // Get user's progress for these words
        const progressMap = new Map<string, { nextReview: Date; reviewCount: number }>();
        const userProgress = await prisma.progress.findMany({
            where: {
                userId: session.user.id,
                wordId: { in: wordIds }
            },
            select: {
                wordId: true,
                nextReview: true,
                reviewCount: true
            }
        });

        userProgress.forEach(p => {
            progressMap.set(p.wordId, { nextReview: p.nextReview, reviewCount: p.reviewCount });
        });

        const now = new Date();

        // Categorize words
        const dueForReview: string[] = [];    // Tekrar zamanı gelmiş
        const neverStudied: string[] = [];     // Hiç çalışılmamış
        const notDueYet: string[] = [];        // Henüz zamanı gelmemiş

        wordIds.forEach(wordId => {
            const progress = progressMap.get(wordId);
            if (!progress) {
                neverStudied.push(wordId);
            } else if (progress.nextReview <= now) {
                dueForReview.push(wordId);
            } else {
                notDueYet.push(wordId);
            }
        });

        // Shuffle each category
        const shuffle = (arr: string[]) => arr.sort(() => Math.random() - 0.5);
        shuffle(dueForReview);
        shuffle(neverStudied);
        shuffle(notDueYet);

        // Smart selection: prioritize due for review, then new words, then others
        let selectedWordIds: string[] = [];

        if (mode === 'smart') {
            // Mix: 60% due for review, 30% new, 10% review later
            const dueCount = Math.min(Math.ceil(limit * 0.6), dueForReview.length);
            const newCount = Math.min(Math.ceil(limit * 0.3), neverStudied.length);
            const laterCount = Math.min(limit - dueCount - newCount, notDueYet.length);

            selectedWordIds = [
                ...dueForReview.slice(0, dueCount),
                ...neverStudied.slice(0, newCount),
                ...notDueYet.slice(0, laterCount)
            ];

            // If we don't have enough, fill from other categories
            const remaining = limit - selectedWordIds.length;
            if (remaining > 0) {
                const allRemaining = [
                    ...dueForReview.slice(dueCount),
                    ...neverStudied.slice(newCount),
                    ...notDueYet.slice(laterCount)
                ];
                selectedWordIds.push(...allRemaining.slice(0, remaining));
            }
        } else if (mode === 'new') {
            // Only new words first
            selectedWordIds = [...neverStudied, ...dueForReview, ...notDueYet].slice(0, limit);
        } else {
            // Random mode - just shuffle everything
            selectedWordIds = shuffle([...wordIds]).slice(0, limit);
        }

        // Final shuffle to mix categories
        shuffle(selectedWordIds);

        // Fetch full word data
        const words = await prisma.word.findMany({
            where: { id: { in: selectedWordIds } }
        });

        // Maintain the shuffled order
        const wordMap = new Map(words.map(w => [w.id, w]));
        const orderedWords = selectedWordIds.map(id => wordMap.get(id)).filter(Boolean);

        return NextResponse.json(orderedWords);
    } catch (error) {
        console.error('Error fetching words:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
