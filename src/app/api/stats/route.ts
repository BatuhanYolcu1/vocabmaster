import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get user for streak and XP
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { streak: true, xp: true }
        });

        // Get total words learned (words in a list)
        const totalWords = await prisma.wordListItem.count({
            where: {
                wordList: { userId }
            }
        });

        // Calculate words to review based on progress
        const wordsToReview = await prisma.progress.count({
            where: {
                userId,
                nextReview: { lte: new Date() }
            }
        });

        // Get real weekly progress from DailyActivity
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const dailyActivities = await prisma.dailyActivity.findMany({
            where: {
                userId,
                date: {
                    gte: sevenDaysAgo,
                    lte: today
                }
            },
            orderBy: { date: 'asc' }
        });

        // Build weekly progress array with Turkish day names
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        const weeklyProgress = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);

            const activity = dailyActivities.find(a => {
                const actDate = new Date(a.date);
                actDate.setHours(0, 0, 0, 0);
                return actDate.getTime() === date.getTime();
            });

            weeklyProgress.push({
                name: dayNames[date.getDay()],
                xp: activity?.xpEarned || 0,
                words: activity?.wordsStudied || 0,
                sessions: activity?.sessionsCompleted || 0
            });
        }

        return NextResponse.json({
            wordsToReview,
            wordsLearned: totalWords,
            dailyGoal: 20,
            streak: user?.streak || 0,
            weeklyProgress,
            totalXp: user?.xp || 0,
        }, {
            headers: {
                'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
