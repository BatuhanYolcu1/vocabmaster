import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan, period, couponCode } = await req.json();

        if (!plan || !['LITE', 'PRO'].includes(plan.toUpperCase())) {
            return NextResponse.json({ error: 'Geçersiz plan seçimi' }, { status: 400 });
        }

        if (!period || !['monthly', 'yearly'].includes(period)) {
            return NextResponse.json({ error: 'Geçersiz periyot seçimi' }, { status: 400 });
        }

        // Coupon validation
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });

            if (!coupon || !coupon.active || (coupon.expiresAt && new Date() > coupon.expiresAt) || coupon.usedCount >= coupon.maxUses || coupon.targetPlan.toUpperCase() !== plan.toUpperCase()) {
                return NextResponse.json({ error: 'Geçersiz veya süresi geçmiş kupon kodu' }, { status: 400 });
            }

            // Update coupon use count
            await prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
            });
        }

        // Calculate subscription end date
        const endsAt = new Date();
        if (period === 'monthly') {
            endsAt.setDate(endsAt.getDate() + 30);
        } else {
            endsAt.setDate(endsAt.getDate() + 365);
        }

        // Update user's subscription
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    subscriptionType: plan.toUpperCase() as any,
                    subscriptionEndsAt: endsAt
                }
            }),
            prisma.activityLog.create({
                data: {
                    userId: session.user.id,
                    action: 'plan_change',
                    details: JSON.stringify({ plan, period, couponCode, endsAt })
                }
            })
        ]);

        return NextResponse.json({ success: true, plan, endsAt: endsAt.toISOString() });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
