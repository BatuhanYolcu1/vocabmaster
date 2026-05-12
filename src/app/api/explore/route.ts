import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch system words with filtering
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const search = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');

        // Build filter
        const where: Record<string, unknown> = { isSystem: true };
        if (category && category !== 'all') where.category = category;
        if (level && level !== 'all') where.level = level;
        if (search) {
            where.OR = [
                { word: { contains: search, mode: 'insensitive' } },
                { turkishTranslation: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [words, total] = await Promise.all([
            prisma.word.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { word: 'asc' },
                select: {
                    id: true,
                    word: true,
                    turkishTranslation: true,
                    type: true,
                    level: true,
                    category: true,
                    exampleSentence: true,
                },
            }),
            prisma.word.count({ where }),
        ]);

        // Get categories and levels for filters
        const categories = await prisma.word.groupBy({
            by: ['category'],
            where: { isSystem: true },
            _count: true,
        });

        const levels = await prisma.word.groupBy({
            by: ['level'],
            where: { isSystem: true },
            _count: true,
        });

        return NextResponse.json({
            words,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            categories: categories.map(c => ({ name: c.category, count: c._count })),
            levels: levels.map(l => ({ name: l.level, count: l._count })),
        });
    } catch (error) {
        console.error('Error fetching explore words:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST - Add word(s) to user's word list
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { wordIds, listId } = await req.json();

        if (!Array.isArray(wordIds) || wordIds.length === 0) {
            return NextResponse.json({ error: 'wordIds is required' }, { status: 400 });
        }

        if (!listId) {
            return NextResponse.json({ error: 'listId is required' }, { status: 400 });
        }

        // Verify the list belongs to user
        const list = await prisma.wordList.findFirst({
            where: { id: listId, userId: session.user.id },
        });

        if (!list) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        // Add words (skip duplicates)
        const results = await Promise.allSettled(
            wordIds.map(wordId =>
                prisma.wordListItem.create({
                    data: { wordListId: listId, wordId },
                }).catch(() => null) // Ignore duplicate errors
            )
        );

        const added = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;

        return NextResponse.json({ added, total: wordIds.length });
    } catch (error) {
        console.error('Error adding words:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
