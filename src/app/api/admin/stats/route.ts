import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin guard helper
async function isAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    return user?.role === 'ADMIN' ? session.user.id : null;
}

// GET /api/admin/stats — Platform overview
export async function GET() {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

        const [
            totalUsers,
            todayUsers,
            weekUsers,
            monthUsers,
            planCounts,
            totalWords,
            systemWords,
            totalLists,
            totalProgress,
            todayProgress,
            activeToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
            prisma.user.groupBy({ by: ['subscriptionType'], _count: true }),
            prisma.word.count(),
            prisma.word.count({ where: { isSystem: true } }),
            prisma.wordList.count(),
            prisma.progress.count(),
            prisma.progress.count({ where: { updatedAt: { gte: todayStart } } }),
            prisma.user.count({ where: { lastStudyDate: { gte: todayStart } } }),
        ]);

        const plans = { FREE: 0, LITE: 0, PRO: 0 };
        planCounts.forEach(p => { plans[p.subscriptionType as keyof typeof plans] = p._count; });

        const estimatedRevenue = (plans.LITE * 29.99) + (plans.PRO * 59.99);

        return NextResponse.json({
            users: { total: totalUsers, today: todayUsers, week: weekUsers, month: monthUsers, activeToday },
            plans,
            words: { total: totalWords, system: systemWords },
            lists: totalLists,
            studySessions: { total: totalProgress, today: todayProgress },
            revenue: { estimated: estimatedRevenue },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
