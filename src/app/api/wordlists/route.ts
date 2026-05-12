import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateWordList, getDailyWordCount } from '@/lib/subscription-server';

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
                },
                items: {
                    include: {
                        word: {
                            include: {
                                progress: {
                                    where: { userId: session.user.id }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(
            wordLists.map(list => {
                const totalItems = list._count.items;
                const studiedItems = list.items.filter(
                    item => item.word.progress && item.word.progress.length > 0
                ).length;
                const masteredItems = list.items.filter(
                    item => item.word.progress && item.word.progress.length > 0 &&
                        item.word.progress[0].interval >= 21 && item.word.progress[0].easeFactor >= 2.0
                ).length;
                return {
                    id: list.id,
                    name: list.name,
                    description: list.description,
                    _count: { items: totalItems },
                    wordCount: totalItems,
                    studiedCount: studiedItems,
                    masteredCount: masteredItems,
                    createdAt: list.createdAt.toISOString(),
                    updatedAt: list.updatedAt.toISOString(),
                };
            })
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

        // 🔒 Check word list limit
        const listCheck = await canCreateWordList(session.user.id);
        if (!listCheck.allowed) {
            return NextResponse.json({
                error: `Kelime listesi limitine ulaştınız (${listCheck.current}/${listCheck.max}). Daha fazla liste oluşturmak için planınızı yükseltin.`,
                code: 'LIST_LIMIT_REACHED',
                current: listCheck.current,
                max: listCheck.max,
                plan: listCheck.plan,
            }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, words } = body;

        if (!name || !words || words.length === 0) {
            return NextResponse.json({ error: 'Name and at least one word required' }, { status: 400 });
        }

        // 🔒 Check daily word limit
        const wordCheck = await getDailyWordCount(session.user.id);
        if (wordCheck.limit !== -1 && (wordCheck.count + words.length) > wordCheck.limit) {
            const remaining = Math.max(0, wordCheck.limit - wordCheck.count);
            return NextResponse.json({
                error: `Günlük kelime ekleme limitine ulaştınız (${wordCheck.count}/${wordCheck.limit}). Kalan: ${remaining} kelime. Planınızı yükseltin.`,
                code: 'DAILY_WORD_LIMIT_REACHED',
                current: wordCheck.count,
                limit: wordCheck.limit,
                remaining,
                plan: wordCheck.plan,
            }, { status: 403 });
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
