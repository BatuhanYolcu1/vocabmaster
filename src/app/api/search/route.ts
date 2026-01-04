import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Search words across user's word lists
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] });
        }

        const searchTerm = query.trim().toLowerCase();

        // Search in user's word lists
        const results = await prisma.wordListItem.findMany({
            where: {
                wordList: {
                    userId: session.user.id
                },
                word: {
                    OR: [
                        { word: { contains: searchTerm, mode: 'insensitive' } },
                        { turkishTranslation: { contains: searchTerm, mode: 'insensitive' } },
                        { definitionTr: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                }
            },
            include: {
                word: {
                    select: {
                        id: true,
                        word: true,
                        turkishTranslation: true,
                        type: true,
                        level: true
                    }
                },
                wordList: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            take: 10
        });

        // Format results
        const formattedResults = results.map(item => ({
            wordId: item.word.id,
            word: item.word.word,
            translation: item.word.turkishTranslation,
            type: item.word.type,
            level: item.word.level,
            listId: item.wordList.id,
            listName: item.wordList.name
        }));

        return NextResponse.json({ results: formattedResults });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
