import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/words/categories - Get word counts by category
export async function GET() {
    try {
        const words = await prisma.word.groupBy({
            by: ['category'],
            _count: {
                category: true
            }
        });

        const categories: Record<string, number> = {};
        words.forEach(w => {
            categories[w.category] = w._count.category;
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
