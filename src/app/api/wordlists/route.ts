import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/wordlists - Get user's word lists
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wordLists = await prisma.wordList.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(
            wordLists.map(list => ({
                id: list.id,
                name: list.name,
                description: list.description,
                _count: { items: list._count.items },
                wordCount: list._count.items,
                createdAt: list.createdAt.toISOString(),
                updatedAt: list.updatedAt.toISOString(),
            }))
        );
    } catch (error) {
        console.error('Error fetching word lists:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST /api/wordlists - Create new word list with words
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, words } = body;

        if (!name || !words || words.length === 0) {
            return NextResponse.json({ error: 'Name and at least one word required' }, { status: 400 });
        }

        // Create word list and words in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the word list
            const wordList = await tx.wordList.create({
                data: {
                    name,
                    description: description || null,
                    userId: session.user.id,
                }
            });

            // Create words and link them to the list
            for (const wordData of words) {
                const word = await tx.word.create({
                    data: {
                        word: wordData.word,
                        definitionTr: wordData.definitionTr || '',
                        exampleSentence: wordData.exampleSentence || '',
                        exampleSentenceTr: wordData.exampleSentenceTr || '',
                        turkishTranslation: wordData.turkishTranslation,
                        type: wordData.type || 'noun',
                        level: 'B1',
                        category: 'Kişisel',
                        isSystem: false,
                        createdByUserId: session.user.id,
                    }
                });

                await tx.wordListItem.create({
                    data: {
                        wordListId: wordList.id,
                        wordId: word.id,
                    }
                });
            }

            return wordList;
        });

        return NextResponse.json({ id: result.id, name: result.name });
    } catch (error) {
        console.error('Error creating word list:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
