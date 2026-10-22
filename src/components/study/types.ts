import type { StudyCard, Distractor } from '@/server/study';
import type { Rating } from '@/lib/srs';

export type { StudyCard, Distractor };

export interface ModeProps {
  card: StudyCard;
  /** Every card in this session (for building options) */
  deck: StudyCard[];
  distractors: Distractor[];
  /** Report the result for a card (called once per attempt) */
  onAnswer: (cardId: string, correct: boolean, rating?: Rating) => void;
  /** Move on to the next card */
  onNext: () => void;
}

export interface MatchingProps {
  cards: StudyCard[];
  onAnswer: (cardId: string, correct: boolean) => void;
  onRoundDone: () => void;
}
