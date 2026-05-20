import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code, plan } = await req.json();
        if (!code) {
            return NextResponse.json({ error: 'Kupon kodu gereklidir' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Geçersiz kupon kodu' }, { status: 404 });
        }

        if (!coupon.active) {
            return NextResponse.json({ error: 'Bu kupon artık aktif değil' }, { status: 400 });
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: 'Kuponun süresi dolmuş' }, { status: 400 });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'Bu kupon maksimum kullanım sınırına ulaşmış' }, { status: 400 });
        }

        if (coupon.targetPlan.toUpperCase() !== plan.toUpperCase()) {
            return NextResponse.json({ error: `Bu kupon sadece ${coupon.targetPlan} planı için geçerlidir` }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            discountPercent: coupon.discount,
            code: coupon.code
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
