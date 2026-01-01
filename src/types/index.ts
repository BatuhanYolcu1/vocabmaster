// Word definition
export interface Word {
    id: string;
    word: string;
    definitionTr: string; // Turkish definition
    exampleSentence: string;
    exampleSentenceTr: string; // Turkish translation of example
    turkishTranslation: string;
    type: 'noun' | 'verb' | 'adjective' | 'adverb';
}

// SRS Card with review metadata
export interface SRSCard {
    word: Word;
    interval: number; // in minutes
    easeFactor: number;
    nextReview: Date;
    reviewCount: number;
}

// Rating types for SRS
export type Rating = 'hard' | 'good' | 'easy';

// Study session statistics
export interface SessionStats {
    totalWords: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
    startTime: Date;
    endTime?: Date;
}

// User progress (simulated)
export interface UserProgress {
    wordsToReview: number;
    wordsLearned: number;
    dailyGoal: number;
    streak: number;
}
