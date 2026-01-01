import { NextRequest, NextResponse } from 'next/server';
import { generateWordDetails } from '@/lib/gemini';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { word } = await request.json();

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: 'AI service not configured',
                mock: true // Signal to UI to use mock/fallback if desired
            }, { status: 503 });
        }

        const details = await generateWordDetails(word);

        if (!details) {
            return NextResponse.json({ error: 'Failed to generate details' }, { status: 500 });
        }

        return NextResponse.json(details);
    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
