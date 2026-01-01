import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Rating, SessionStats, SRSCard, Word } from '@/types';
import { calculateNextReview, createSRSCard } from './srs';

interface StudyStore {
    // Session state
    isSessionActive: boolean;
    cards: SRSCard[];
    currentIndex: number;
    isFlipped: boolean;

    // Statistics
    stats: SessionStats | null;

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
                        startTime: new Date(),
                    },
                });
            },

            flipCard: () => {
                set((state) => ({ isFlipped: !state.isFlipped }));
            },

            rateCard: (rating: Rating) => {
                const { cards, currentIndex, stats } = get();
                if (currentIndex >= cards.length || !stats) return;

                // Update the card with new SRS values
                const updatedCard = calculateNextReview(cards[currentIndex], rating);
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
                    set({
                        isSessionActive: false,
                        stats: {
                            ...stats,
                            endTime: new Date(),
                        },
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
                });
            },
        }),
        {
            name: 'vocab-study-storage',
            skipHydration: true, // Hydration issues fix for Next.js
        }
    )
);
