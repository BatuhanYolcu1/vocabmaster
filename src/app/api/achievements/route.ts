import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/achievements - Get all achievements with user's progress
export async function GET() {
    try {
        const session = await auth();

        // Get all achievements
        const allAchievements = await prisma.achievement.findMany({
            orderBy: { xpReward: 'asc' }
        });

        let userAchievementIds: Set<string> = new Set();
        let totalXpEarned = 0;

        if (session?.user?.id) {
            // Get user's earned achievements
            const userAchievements = await prisma.userAchievement.findMany({
                where: { userId: session.user.id },
                include: { achievement: true }
            });

            userAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
            totalXpEarned = userAchievements.reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
        }

        const achievements = allAchievements.map(a => ({
            id: a.id,
            name: a.name,
            nameTr: a.nameTr,
            description: a.description,
            descriptionTr: a.descriptionTr,
            icon: a.icon,
            xpReward: a.xpReward,
            earned: userAchievementIds.has(a.id),
        }));

        return NextResponse.json({
            achievements,
            earnedCount: userAchievementIds.size,
            totalCount: allAchievements.length,
            totalXpEarned,
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
