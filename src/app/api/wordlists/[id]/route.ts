import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/wordlists/[id] - Get word list with words
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const wordList = await prisma.wordList.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        word: true
                    }
                }
            }
        });

        if (!wordList) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: wordList.id,
            name: wordList.name,
            description: wordList.description,
            words: wordList.items.map(item => ({
                id: item.word.id,
                word: item.word.word,
                turkishTranslation: item.word.turkishTranslation,
                definitionTr: item.word.definitionTr,
                type: item.word.type,
            }))
        });
    } catch (error) {
        console.error('Error fetching word list:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE /api/wordlists/[id] - Delete word list
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const wordList = await prisma.wordList.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!wordList) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (wordList.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete associated words (only user-created ones)
        const wordIds = wordList.items.map(item => item.wordId);
        await prisma.word.deleteMany({
            where: {
                id: { in: wordIds },
                isSystem: false,
                createdByUserId: session.user.id
            }
        });

        // Delete the list (cascades to items)
        await prisma.wordList.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting word list:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
