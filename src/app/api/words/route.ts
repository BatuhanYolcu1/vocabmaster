import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/words - Get words with optional filters (USER-SCOPED)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const listId = searchParams.get('listId');

        let words;

        if (listId) {
            // Get words from a specific list - verify list belongs to user
            const wordList = await prisma.wordList.findFirst({
                where: {
                    id: listId,
                    userId: session.user.id // Security: only user's own lists
                }
            });

            if (!wordList) {
                return NextResponse.json({ error: 'List not found' }, { status: 404 });
            }

            const listItems = await prisma.wordListItem.findMany({
                where: { wordListId: listId },
                include: { word: true },
                take: limit,
            });
            words = listItems.map(item => item.word);
        } else {
            // Get words from user's lists only
            const userListItems = await prisma.wordListItem.findMany({
                where: {
                    wordList: { userId: session.user.id }
                },
                include: { word: true },
                take: limit,
            });
            words = userListItems.map(item => item.word);
        }

        // Shuffle words for variety
        const shuffled = words.sort(() => Math.random() - 0.5);

        return NextResponse.json(shuffled);
    } catch (error) {
        console.error('Error fetching words:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
