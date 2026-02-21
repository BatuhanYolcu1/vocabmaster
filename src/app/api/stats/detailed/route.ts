import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Son 30 günün aktiviteleri (Aylık Trend)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activities = await prisma.dailyActivity.findMany({
            where: {
                userId,
                date: { gte: thirtyDaysAgo }
            },
            orderBy: { date: 'asc' }
        });

        // 30 günü doldur (boş günler için 0 ekle)
        const monthlyTrend = Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            date.setHours(0, 0, 0, 0);

            const activity = activities.find(a => {
                const aDate = new Date(a.date);
                aDate.setHours(0, 0, 0, 0);
                return aDate.getTime() === date.getTime();
            });

            return {
                date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                xp: activity?.xpEarned || 0,
                words: activity?.wordsStudied || 0,
                sessions: activity?.sessionsCompleted || 0
            };
        });

        // 2. Kategori ve Seviye Dağılımı
        const allProgress = await prisma.progress.findMany({
            where: { userId, reviewCount: { gt: 0 } },
            include: {
                word: {
                    select: { category: true, level: true, type: true }
                }
            }
        });

        const categoryStats = allProgress.reduce((acc, curr) => {
            const cat = curr.word.category || 'Genel';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

        const typeStats = allProgress.reduce((acc, curr) => {
            const type = curr.word.type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const typeChartData = Object.entries(typeStats).map(([name, value]) => ({ name, value }));

        // 3. Genel İstatistikler
        let totalCorrect = 0;
        let totalWrong = 0;
        let masteredCount = 0;
        let learningCount = 0;

        allProgress.forEach(p => {
            totalCorrect += p.correctCount;
            totalWrong += p.wrongCount;
            if (p.interval >= 1440) {
                masteredCount++;
            } else {
                learningCount++;
            }
        });

        const totalAttempts = totalCorrect + totalWrong;
        const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

        // 4. En çok hata yapılan kelimeler (Zayıf Kelimeler)
        const weakWordsRaw = await prisma.progress.findMany({
            where: { userId, wrongCount: { gt: 0 } },
            orderBy: { wrongCount: 'desc' },
            take: 10,
            include: {
                word: {
                    select: { word: true, turkishTranslation: true, type: true }
                }
            }
        });

        const weakWords = weakWordsRaw.map(p => {
            const attempts = p.correctCount + p.wrongCount;
            const accuracy = Math.round((p.correctCount / attempts) * 100);
            return {
                id: p.wordId,
                word: p.word.word,
                translation: p.word.turkishTranslation,
                type: p.word.type,
                wrongCount: p.wrongCount,
                accuracy
            };
        });

        return NextResponse.json({
            monthlyTrend,
            categoryStats: categoryChartData,
            typeStats: typeChartData,
            overview: {
                totalLearned: allProgress.length,
                masteredCount,
                learningCount,
                overallAccuracy,
                totalReviews: totalAttempts
            },
            weakWords
        });

    } catch (error) {
        console.error('Failed to fetch detailed stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
