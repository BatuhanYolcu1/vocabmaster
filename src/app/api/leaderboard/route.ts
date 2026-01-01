import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard - Get top users by XP
export async function GET() {
    try {
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
        }));

        return NextResponse.json(rankedUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
