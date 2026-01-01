import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/words - Get words with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const listId = searchParams.get('listId');

        let words;

        if (listId) {
            // Get words from a specific list
            const listItems = await prisma.wordListItem.findMany({
                where: { wordListId: listId },
                include: { word: true },
                take: limit,
            });
            words = listItems.map(item => item.word);
        } else {
            // Get words with filters
            words = await prisma.word.findMany({
                where: {
                    ...(category && { category }),
                    ...(level && { level }),
                },
                take: limit,
                orderBy: { createdAt: 'desc' },
            });
        }

        // Shuffle words for variety
        const shuffled = words.sort(() => Math.random() - 0.5);

        return NextResponse.json(shuffled);
    } catch (error) {
        console.error('Error fetching words:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
