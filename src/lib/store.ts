import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Rating, SRSCard, Word } from '@/types';
import { calculateNextReview, createSRSCard } from './srs';

// Session stats with ISO string dates for serialization
interface SessionStats {
    totalWords: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
    startTime: string; // ISO string
    endTime?: string;  // ISO string
}

interface StudyStore {
    // Session state
    isSessionActive: boolean;
    cards: SRSCard[];
    currentIndex: number;
    isFlipped: boolean;

    // Statistics
    stats: SessionStats | null;
    lastCompletedStats: SessionStats | null;

    // Hydration
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    // Actions
    startSession: (words: Word[]) => void;
    flipCard: () => void;
    rateCard: (rating: Rating) => void;
    nextCard: () => void;
    endSession: () => void;
    resetSession: () => void;
}

export const useStudyStore = create<StudyStore>()(
    persist(
        (set, get) => ({
            isSessionActive: false,
            cards: [],
            currentIndex: 0,
            isFlipped: false,
            stats: null,
            lastCompletedStats: null,
            _hasHydrated: false,

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },

            startSession: (words: Word[]) => {
                const cards = words.map(createSRSCard);
                set({
                    isSessionActive: true,
                    cards,
                    currentIndex: 0,
                    isFlipped: false,
                    stats: {
                        totalWords: words.length,
                        hardCount: 0,
                        goodCount: 0,
                        easyCount: 0,
                        startTime: new Date().toISOString(),
                    },
                    lastCompletedStats: null,
                });
            },

            flipCard: () => {
                set((state) => ({ isFlipped: !state.isFlipped }));
            },

            rateCard: (rating: Rating) => {
                const { cards, currentIndex, stats } = get();
                if (currentIndex >= cards.length || !stats) return;

                const currentCard = cards[currentIndex];

                // Update the card with new SRS values
                const updatedCard = calculateNextReview(currentCard, rating);
                const updatedCards = [...cards];
                updatedCards[currentIndex] = updatedCard;

                // Update statistics
                const newStats = { ...stats };
                if (rating === 'hard') newStats.hardCount++;
                else if (rating === 'good') newStats.goodCount++;
                else if (rating === 'easy') newStats.easyCount++;

                set({
                    cards: updatedCards,
                    stats: newStats,
                });

                // Persist progress to database (fire and forget)
                const isCorrect = rating !== 'hard';
                fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        wordId: currentCard.word.id,
                        rating,
                        isCorrect
                    })
                }).catch(err => console.error('Failed to update progress:', err));

                // Move to next card
                get().nextCard();
            },

            nextCard: () => {
                const { currentIndex, cards } = get();
                if (currentIndex < cards.length - 1) {
                    set({
                        currentIndex: currentIndex + 1,
                        isFlipped: false,
                    });
                } else {
                    // End session when all cards are reviewed
                    get().endSession();
                }
            },

            endSession: () => {
                const { stats } = get();
                if (stats) {
                    const completedStats: SessionStats = {
                        ...stats,
                        endTime: new Date().toISOString(),
                    };

                    // Send XP immediately when session ends
                    const xpEarned = (stats.goodCount * 5) + (stats.easyCount * 10);
                    if (xpEarned > 0) {
                        fetch('/api/xp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: xpEarned, source: 'flashcard' })
                        }).catch(err => console.error('XP Error:', err));
                    }

                    set({
                        isSessionActive: false,
                        stats: completedStats,
                        lastCompletedStats: completedStats,
                    });
                }
            },

            resetSession: () => {
                set({
                    isSessionActive: false,
                    cards: [],
                    currentIndex: 0,
                    isFlipped: false,
                    stats: null,
                    // Keep lastCompletedStats for display
                });
            },
        }),
        {
            name: 'vocab-study-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
