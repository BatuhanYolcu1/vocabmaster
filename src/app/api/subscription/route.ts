import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlanInfo } from '@/lib/subscription-server';

// GET /api/subscription - Get current user's subscription info
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const planInfo = await getUserPlanInfo(session.user.id);
        if (!planInfo) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            plan: planInfo.plan,
            limits: {
                dailyWordLimit: planInfo.limits.dailyWordLimit === Infinity ? -1 : planInfo.limits.dailyWordLimit,
                maxWordLists: planInfo.limits.maxWordLists === Infinity ? -1 : planInfo.limits.maxWordLists,
                dailyAILimit: planInfo.limits.dailyAILimit === Infinity ? -1 : planInfo.limits.dailyAILimit,
                studyModes: planInfo.limits.studyModes,
                hasDetailedStats: planInfo.limits.hasDetailedStats,
                hasExcelImport: planInfo.limits.hasExcelImport,
                hasStoryMode: planInfo.limits.hasStoryMode,
                hasPrioritySupport: planInfo.limits.hasPrioritySupport,
                adFree: planInfo.limits.adFree,
            },
            usage: {
                aiUsageCount: planInfo.aiUsageCount,
                aiLimitReached: planInfo.aiLimitReached,
            },
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
