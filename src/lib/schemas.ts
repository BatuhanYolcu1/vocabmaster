import { z } from 'zod';
import { CEFR_LEVELS, WORD_TYPES } from './constants';
import { STUDY_MODES } from './study-modes';

const trimmed = (max: number) => z.string().trim().max(max);

export const wordInputSchema = z.object({
  word: trimmed(80).min(1, 'İngilizce kelime boş olamaz.'),
  turkishTranslation: trimmed(160).min(1, 'Türkçe anlamı boş olamaz.'),
  definitionTr: trimmed(500).optional().default(''),
  exampleSentence: trimmed(400).optional().default(''),
  exampleSentenceTr: trimmed(400).optional().default(''),
  type: z.enum(WORD_TYPES).optional().default('noun'),
  pronunciation: trimmed(80).optional().default(''),
});
export type WordInput = z.infer<typeof wordInputSchema>;

export const listCreateSchema = z.object({
  name: trimmed(80).min(1, 'Liste adı boş olamaz.'),
  description: trimmed(300).optional().default(''),
  words: z.array(wordInputSchema).max(500, 'Tek seferde en fazla 500 kelime ekleyebilirsin.').optional().default([]),
  wordIds: z.array(z.string().min(1)).max(500).optional().default([]),
});

export const listUpdateSchema = z.object({
  name: trimmed(80).min(1, 'Liste adı boş olamaz.').optional(),
  description: trimmed(300).optional(),
});

export const listAddWordsSchema = z.object({
  words: z.array(wordInputSchema).max(500).optional().default([]),
  wordIds: z.array(z.string().min(1)).max(500).optional().default([]),
});

export const registerSchema = z.object({
  name: trimmed(50).min(2, 'Adın en az 2 karakter olmalı.'),
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi gir.').max(200),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(200),
});

export const profileUpdateSchema = z.object({
  name: trimmed(50).min(2, 'Adın en az 2 karakter olmalı.').optional(),
  image: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || v.startsWith('https://'), 'Avatar adresi https ile başlamalı.')
    .nullable()
    .optional(),
  dailyGoal: z.number().int().min(1).max(200).optional(),
  languageLevel: z.enum(CEFR_LEVELS).optional(),
  interests: z.array(trimmed(40)).max(10).optional(),
  onboardingComplete: z.boolean().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().max(200).optional().default(''),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı.').max(200),
});

export const sessionStartSchema = z.object({
  mode: z.enum(STUDY_MODES),
  source: z.string().max(200).default('daily'),
  size: z.number().int().min(4).max(50).default(10),
});

export const answerSchema = z.object({
  sessionId: z.string().min(1).nullable().optional(),
  wordId: z.string().min(1),
  mode: z.enum(STUDY_MODES),
  correct: z.boolean(),
  rating: z.enum(['hard', 'good', 'easy']).optional(),
});

/** Editing a word: every field optional, no defaults (so untouched fields stay as they are). */
export const wordPatchSchema = z.object({
  word: trimmed(80).min(1, 'İngilizce kelime boş olamaz.').optional(),
  turkishTranslation: trimmed(160).min(1, 'Türkçe anlamı boş olamaz.').optional(),
  definitionTr: trimmed(500).optional(),
  exampleSentence: trimmed(400).optional(),
  exampleSentenceTr: trimmed(400).optional(),
  type: z.enum(WORD_TYPES).optional(),
  pronunciation: trimmed(80).optional(),
});
