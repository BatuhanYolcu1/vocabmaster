import { Rating, SRSCard, Word } from '@/types';

// SM-2 Algorithm Constants
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.0;

// Card states
export type CardState = 'new' | 'learning' | 'review' | 'mastered';

// Create a new SRS card from a word
export function createSRSCard(word: Word): SRSCard {
    return {
        word,
        interval: 0,
        easeFactor: DEFAULT_EASE_FACTOR,
        nextReview: new Date(),
        reviewCount: 0,
    };
}

// Get card state based on review history
export function getCardState(reviewCount: number, interval: number): CardState {
    if (reviewCount === 0) return 'new';
    if (interval < 1440) return 'learning'; // less than 1 day
    if (interval >= 21 * 1440) return 'mastered'; // 21+ days
    return 'review';
}

// Full SM-2 algorithm implementation
export function calculateNextReview(card: SRSCard, rating: Rating): SRSCard {
    let newInterval: number;
    let newEaseFactor = card.easeFactor;
    const isFirstReview = card.reviewCount === 0;

    // Map rating to quality (0-5 scale used by SM-2)
    const qualityMap: Record<Rating, number> = {
        'hard': 1,
        'good': 3,
        'easy': 5,
    };
    const quality = qualityMap[rating];

    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));

    switch (rating) {
        case 'hard':
            if (isFirstReview || card.interval < 1440) {
                newInterval = 1; // 1 minute - show again soon
            } else {
                // Reduce interval by 50%, minimum 1 day
                newInterval = Math.max(1440, Math.round(card.interval * 0.5));
            }
            break;

        case 'good':
            if (isFirstReview) {
                newInterval = 10; // 10 minutes
            } else if (card.interval < 10) {
                newInterval = 1440; // 1 day
            } else if (card.interval < 1440) {
                newInterval = 1440; // 1 day
            } else {
                // Standard SM-2: interval * ease factor
                newInterval = Math.round(card.interval * newEaseFactor);
            }
            break;

        case 'easy':
            if (isFirstReview) {
                newInterval = 4 * 1440; // 4 days
            } else if (card.interval < 1440) {
                newInterval = 4 * 1440; // 4 days
            } else {
                // Interval * ease factor * 1.3 bonus
                newInterval = Math.round(card.interval * newEaseFactor * 1.3);
            }
            break;
    }

    // Cap maximum interval at 180 days
    newInterval = Math.min(newInterval, 180 * 1440);

    const nextReview = new Date();
    nextReview.setMinutes(nextReview.getMinutes() + newInterval);

    return {
        ...card,
        interval: newInterval,
        easeFactor: newEaseFactor,
        nextReview,
        reviewCount: card.reviewCount + 1,
    };
}

// Format interval for display
export function formatInterval(rating: Rating, currentInterval: number = 0, easeFactor: number = 2.5): string {
    // Calculate what the next interval would be
    const card: SRSCard = {
        word: {} as Word,
        interval: currentInterval,
        easeFactor,
        nextReview: new Date(),
        reviewCount: currentInterval > 0 ? 1 : 0,
    };

    const result = calculateNextReview(card, rating);
    return formatMinutes(result.interval);
}

// Helper to format minutes into human readable string
export function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}dk`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}sa`;
    const days = Math.round(minutes / 1440);
    if (days < 30) return `${days}g`;
    const months = Math.round(days / 30);
    return `${months}ay`;
}

// Calculate XP reward based on rating and streak
export function calculateXP(rating: Rating, streak: number): number {
    const baseXP: Record<Rating, number> = {
        'hard': 3,
        'good': 5,
        'easy': 8,
    };

    let xp = baseXP[rating];

    // Streak bonus (max 2x at 30 day streak)
    const streakMultiplier = 1 + Math.min(streak / 30, 1);
    xp = Math.round(xp * streakMultiplier);

    return xp;
}
