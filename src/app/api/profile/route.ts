import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user profile
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                xp: true,
                level: true,
                streak: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, image, level, dailyGoal, interests, onboardingComplete } = body;

        // Validate name
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 2) {
                return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
            }
            if (name.length > 50) {
                return NextResponse.json({ error: 'Name must be less than 50 characters' }, { status: 400 });
            }
        }

        // Validate image URL if provided
        if (image !== undefined && image !== null) {
            if (typeof image !== 'string') {
                return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
            }
            // Basic URL validation
            if (image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:image/')) {
                return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
            }
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (image !== undefined) updateData.image = image || null;
        
        // Onboarding fields
        if (level !== undefined) updateData.languageLevel = level;
        if (dailyGoal !== undefined) updateData.dailyGoal = Number(dailyGoal);
        if (interests !== undefined) {
            updateData.interests = Array.isArray(interests) ? interests.join(',') : interests;
        }
        if (onboardingComplete !== undefined) updateData.onboardingComplete = Boolean(onboardingComplete);

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                xp: true,
                level: true,
                streak: true,
                dailyGoal: true,
                languageLevel: true,
                onboardingComplete: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
