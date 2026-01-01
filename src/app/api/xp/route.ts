import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Level thresholds
const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Başlangıç' },
    { level: 2, xp: 100, title: 'Yeni Başlayan' },
    { level: 3, xp: 250, title: 'Çırak' },
    { level: 4, xp: 500, title: 'Öğrenci' },
    { level: 5, xp: 800, title: 'Öğrenci' },
    { level: 6, xp: 1200, title: 'Pratisyen' },
    { level: 7, xp: 1700, title: 'Pratisyen' },
    { level: 8, xp: 2300, title: 'Deneyimli' },
    { level: 9, xp: 3000, title: 'Deneyimli' },
    { level: 10, xp: 4000, title: 'Uzman' },
    { level: 15, xp: 7500, title: 'Usta' },
    { level: 20, xp: 12000, title: 'Üstad' },
    { level: 50, xp: 50000, title: 'Efsane' },
];

function calculateLevel(xp: number): { level: number; title: string } {
    let result = LEVEL_THRESHOLDS[0];
    for (const threshold of LEVEL_THRESHOLDS) {
        if (xp >= threshold.xp) {
            result = threshold;
        } else {
            break;
        }
    }
    return result;
}

// POST /api/xp - Add XP and update level
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const { amount, source } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 });
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            console.log("🔥 XP API: ERROR - User not found in DB");
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`🔥 XP API: User Found. Current XP: ${user.xp}, Adding: ${amount}`);

        const newXp = user.xp + amount;
        const { level: newLevel, title } = calculateLevel(newXp);
        const leveledUp = newLevel > user.level;

        // Check if this is a new day for streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = user.streak;
        if (user.lastStudyDate) {
            const lastStudy = new Date(user.lastStudyDate);
            lastStudy.setHours(0, 0, 0, 0);

            const dayDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                newStreak = user.streak + 1;
            } else if (dayDiff > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                xp: newXp,
                level: newLevel,
                streak: newStreak,
                lastStudyDate: new Date(),
            },
        });

        // Track daily activity for weekly chart
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        await prisma.dailyActivity.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: todayStart,
                }
            },
            update: {
                xpEarned: { increment: amount },
                sessionsCompleted: { increment: 1 },
            },
            create: {
                userId: session.user.id,
                date: todayStart,
                xpEarned: amount,
                wordsStudied: 0,
                sessionsCompleted: 1,
            }
        });

        // Check for achievements
        const newAchievements = await checkAchievements(session.user.id, {
            xp: newXp,
            level: newLevel,
            streak: newStreak,
        });

        return NextResponse.json({
            xp: updatedUser.xp,
            level: updatedUser.level,
            title,
            streak: updatedUser.streak,
            leveledUp,
            xpGained: amount,
            newAchievements,
        });
    } catch (error) {
        console.error('🔥 XP API: CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Check and award achievements
async function checkAchievements(userId: string, stats: { xp: number; level: number; streak: number }) {
    const newAchievements: string[] = [];

    // Get all achievements user doesn't have
    const unearned = await prisma.achievement.findMany({
        where: {
            users: {
                none: { userId }
            }
        }
    });

    for (const achievement of unearned) {
        const condition = JSON.parse(achievement.condition);
        let earned = false;

        if (condition.wordsLearned && stats.xp >= condition.wordsLearned * 10) {
            earned = true;
        }
        if (condition.streak && stats.streak >= condition.streak) {
            earned = true;
        }
        if (condition.level && stats.level >= condition.level) {
            earned = true;
        }

        if (earned) {
            await prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id,
                }
            });

            // Award achievement XP
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: achievement.xpReward } }
            });

            newAchievements.push(achievement.nameTr);
        }
    }

    return newAchievements;
}

// GET /api/xp - Get user XP stats
export async function GET() {
    console.log("🔥 XP API: GET Request received");
    try {
        const session = await auth();

        if (!session?.user?.id) {
            console.log("🔥 XP API: GET ERROR - Unauthorized");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { xp: true, level: true, streak: true, lastStudyDate: true },
        });

        if (!user) {
            console.log("🔥 XP API: GET ERROR - User not found");
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`🔥 XP API: GET SUCCESS. Returning XP: ${user.xp}`);

        const { title } = calculateLevel(user.xp);
        const nextLevel = LEVEL_THRESHOLDS.find(t => t.xp > user.xp);
        const xpForNext = nextLevel ? nextLevel.xp - user.xp : 0;

        return NextResponse.json({
            xp: user.xp,
            level: user.level,
            title,
            streak: user.streak,
            xpForNextLevel: xpForNext,
            lastStudyDate: user.lastStudyDate,
        });
    } catch (error) {
        console.error('🔥 XP API: GET CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
