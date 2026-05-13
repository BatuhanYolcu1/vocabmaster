import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    return user?.role === 'ADMIN' ? session.user.id : null;
}

// GET — List users with search & filter
export async function GET(req: NextRequest) {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const plan = searchParams.get('plan') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;

        const where: Record<string, unknown> = {};
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (plan && plan !== 'all') where.subscriptionType = plan;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, name: true, email: true, image: true,
                    role: true, subscriptionType: true, xp: true, level: true,
                    streak: true, lastStudyDate: true, createdAt: true,
                    aiUsageCount: true, onboardingComplete: true,
                    _count: { select: { wordLists: true, progress: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT — Update user (plan, role, ban)
export async function PUT(req: NextRequest) {
    try {
        const adminId = await isAdmin();
        if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { userId, subscriptionType, role } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const data: Record<string, unknown> = {};
        if (subscriptionType) data.subscriptionType = subscriptionType;
        if (role) data.role = role;

        const updated = await prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, subscriptionType: true, role: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
