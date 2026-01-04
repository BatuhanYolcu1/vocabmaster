import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's notifications
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: [
                { read: 'asc' },
                { createdAt: 'desc' }
            ],
            take: 20
        });

        const unreadCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT - Mark notification as read
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false
                },
                data: { read: true }
            });
        } else if (notificationId) {
            // Mark specific notification as read
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId: session.user.id
                },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST - Create notification (for system/internal use)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, title, message, userId } = body;

        // Type validation
        const validTypes = ['streak_reminder', 'achievement_unlocked', 'level_up', 'review_due'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId: userId || session.user.id,
                type,
                title,
                message
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
