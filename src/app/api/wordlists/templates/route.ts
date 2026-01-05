import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all system word list templates
export async function GET() {
    try {
        const templates = await prisma.wordList.findMany({
            where: {
                isSystem: true
            },
            include: {
                items: {
                    include: {
                        word: {
                            select: {
                                id: true,
                                word: true,
                                turkishTranslation: true,
                                type: true,
                                level: true
                            }
                        }
                    },
                    take: 5 // Preview first 5 words
                },
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        const formattedTemplates = templates.map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            wordCount: template._count.items,
            previewWords: template.items.map(item => ({
                word: item.word.word,
                translation: item.word.turkishTranslation
            }))
        }));

        return NextResponse.json(formattedTemplates, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
