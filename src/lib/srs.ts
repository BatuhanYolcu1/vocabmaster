import { Rating, SRSCard, Word } from '@/types';

// Default values for new cards
const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL = 1; // 1 minute

// Create a new SRS card from a word
export function createSRSCard(word: Word): SRSCard {
    return {
        word,
        interval: DEFAULT_INTERVAL,
        easeFactor: DEFAULT_EASE_FACTOR,
        nextReview: new Date(),
        reviewCount: 0,
    };
}

// Simplified SuperMemo-2 algorithm
export function calculateNextReview(card: SRSCard, rating: Rating): SRSCard {
    let newInterval: number;
    let newEaseFactor = card.easeFactor;

    switch (rating) {
        case 'hard':
            // Reset to 1 minute, decrease ease factor
            newInterval = 1;
            newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
            break;
        case 'good':
            // Schedule for 1 day (1440 minutes)
            newInterval = 1440;
            newEaseFactor = card.easeFactor;
            break;
        case 'easy':
            // Schedule for 4 days (5760 minutes)
            newInterval = 5760;
            newEaseFactor = Math.min(3.0, card.easeFactor + 0.1);
            break;
    }

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
export function formatInterval(rating: Rating): string {
    switch (rating) {
        case 'hard':
            return '1m';
        case 'good':
            return '1d';
        case 'easy':
            return '4d';
    }
}
