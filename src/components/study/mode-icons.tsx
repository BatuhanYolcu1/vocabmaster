import { Headphones, Keyboard, Layers, ListChecks, Mic, Puzzle, TextCursorInput } from 'lucide-react';
import type { StudyMode } from '@/lib/study-modes';

export const MODE_ICONS: Record<StudyMode, React.ComponentType<{ className?: string }>> = {
  flashcard: Layers,
  'multiple-choice': ListChecks,
  typing: Keyboard,
  matching: Puzzle,
  listening: Headphones,
  'fill-blank': TextCursorInput,
  speaking: Mic,
};

export const MODE_TONES: Record<StudyMode, string> = {
  flashcard: 'bg-primary-soft text-primary-soft-fg',
  'multiple-choice': 'bg-success-soft text-success',
  typing: 'bg-violet-soft text-violet',
  matching: 'bg-xp-soft text-xp',
  listening: 'bg-primary-soft text-primary-soft-fg',
  'fill-blank': 'bg-streak-soft text-streak',
  speaking: 'bg-danger-soft text-danger',
};
