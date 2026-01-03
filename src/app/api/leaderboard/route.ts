import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard - Get top users by XP with time period filtering
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // 'week', 'month', 'all'

        let dateFilter: Date | undefined;

        if (period === 'week') {
            dateFilter = new Date();
            dateFilter.setDate(dateFilter.getDate() - 7);
        } else if (period === 'month') {
            dateFilter = new Date();
            dateFilter.setMonth(dateFilter.getMonth() - 1);
        }

        // For weekly/monthly, we need to sum XP from DailyActivity
        if (dateFilter) {
            const activities = await prisma.dailyActivity.groupBy({
                by: ['userId'],
                where: {
                    date: { gte: dateFilter }
                },
                _sum: {
                    xpEarned: true
                },
                orderBy: {
                    _sum: {
                        xpEarned: 'desc'
                    }
                },
                take: 20
            });

            // Get user details for these IDs
            const userIds = activities.map(a => a.userId);
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    level: true,
                    streak: true,
                }
            });

            const userMap = new Map(users.map(u => [u.id, u]));

            const rankedUsers = activities.map((activity, index) => {
                const user = userMap.get(activity.userId);
                return {
                    rank: index + 1,
                    id: activity.userId,
                    name: user?.name || 'Unknown',
                    image: user?.image,
                    xp: activity._sum.xpEarned || 0,
                    level: user?.level || 1,
                    streak: user?.streak || 0,
                    isCurrentUser: session?.user?.id === activity.userId
                };
            });

            return NextResponse.json(rankedUsers);
        }

        // All-time leaderboard
        const users = await prisma.user.findMany({
            where: {
                xp: { gt: 0 }
            },
            orderBy: { xp: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                image: true,
                xp: true,
                level: true,
                streak: true,
            }
        });

        const rankedUsers = users.map((user, index) => ({
            rank: index + 1,
            ...user,
            isCurrentUser: session?.user?.id === user.id
        }));

        return NextResponse.json(rankedUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
