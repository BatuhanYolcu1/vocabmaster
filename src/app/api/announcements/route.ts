import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        let targetPlan = null;
        
        if (session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { subscriptionType: true },
            });
            targetPlan = user?.subscriptionType || 'FREE';
        }

        const now = new Date();
        const announcements = await prisma.announcement.findMany({
            where: {
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ],
                AND: [
                    {
                        OR: [
                            { targetPlan: null },
                            { targetPlan: targetPlan ? targetPlan : 'FREE' }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(announcements);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
