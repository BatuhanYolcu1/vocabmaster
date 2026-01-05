import { NextRequest, NextResponse } from 'next/server';
import { getWordsByCategory, getCategoryWordCounts } from '@/lib/wordBankIndex';

// GET /api/words/bank - Kelime bankasından kelimeleri getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const random = searchParams.get('random') === 'true';

    // Kategori sayılarını döndür
    if (searchParams.get('counts') === 'true') {
        return NextResponse.json(getCategoryWordCounts());
    }

    // Kategori yoksa tüm kategorileri döndür
    if (!category) {
        return NextResponse.json({
            categories: Object.keys(getCategoryWordCounts()),
            counts: getCategoryWordCounts()
        });
    }

    // Kategorideki kelimeleri getir
    let words = getWordsByCategory(category);

    if (words.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Rastgele sıralama
    if (random) {
        words = [...words].sort(() => Math.random() - 0.5);
    }

    // Sayfalama
    const paginatedWords = words.slice(offset, offset + limit);

    return NextResponse.json({
        category,
        total: words.length,
        offset,
        limit,
        words: paginatedWords.map((w, idx) => ({
            id: `${category}-${offset + idx + 1}`,
            ...w
        }))
    });
}
