import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    return user?.role === 'ADMIN' ? session.user.id : null;
}

// GET — List system words
export async function GET(req: NextRequest) {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 30;

        const where: Record<string, unknown> = { isSystem: true };
        if (q) where.OR = [{ word: { contains: q, mode: 'insensitive' } }, { turkishTranslation: { contains: q, mode: 'insensitive' } }];
        if (category && category !== 'all') where.category = category;

        const [words, total] = await Promise.all([
            prisma.word.findMany({ where, orderBy: { word: 'asc' }, skip: (page - 1) * limit, take: limit }),
            prisma.word.count({ where }),
        ]);

        return NextResponse.json({ words, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Admin words error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — Add system word
export async function POST(req: NextRequest) {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const word = await prisma.word.create({
            data: {
                word: body.word,
                turkishTranslation: body.turkishTranslation,
                definitionTr: body.definitionTr || '',
                exampleSentence: body.exampleSentence || '',
                exampleSentenceTr: body.exampleSentenceTr || '',
                type: body.type || 'noun',
                level: body.level || 'B1',
                category: body.category || 'Genel',
                isSystem: true,
            },
        });
        return NextResponse.json(word);
    } catch (error) {
        console.error('Admin word create error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE — Delete system word
export async function DELETE(req: NextRequest) {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { wordId } = await req.json();
        await prisma.wordListItem.deleteMany({ where: { wordId } });
        await prisma.progress.deleteMany({ where: { wordId } });
        await prisma.word.delete({ where: { id: wordId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin word delete error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
