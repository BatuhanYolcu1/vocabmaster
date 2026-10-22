export const STUDY_MODES = [
  'flashcard',
  'multiple-choice',
  'typing',
  'matching',
  'listening',
  'fill-blank',
  'speaking',
] as const;

export type StudyMode = (typeof STUDY_MODES)[number];

export interface StudyModeInfo {
  id: StudyMode;
  name: string;
  description: string;
  skill: string;
  /** Needs an example sentence that contains the word */
  needsExample?: boolean;
  /** Needs the browser's speech recognition */
  needsSpeech?: boolean;
  /** Fewer words make the mode awkward (matching uses a board) */
  minWords?: number;
}

export const STUDY_MODE_INFO: Record<StudyMode, StudyModeInfo> = {
  flashcard: {
    id: 'flashcard',
    name: 'Kartlar',
    description: 'Kartı çevir, ne kadar iyi bildiğini işaretle.',
    skill: 'Hatırlama',
  },
  'multiple-choice': {
    id: 'multiple-choice',
    name: 'Çoktan seçmeli',
    description: 'Dört seçenekten doğru anlamı bul.',
    skill: 'Tanıma',
  },
  typing: {
    id: 'typing',
    name: 'Yazma',
    description: 'Türkçesini gör, İngilizcesini yaz.',
    skill: 'Yazım',
  },
  matching: {
    id: 'matching',
    name: 'Eşleştirme',
    description: 'Kelimeleri anlamlarıyla hızla eşleştir.',
    skill: 'Hız',
    minWords: 4,
  },
  listening: {
    id: 'listening',
    name: 'Dinleme',
    description: 'Duyduğun kelimeyi yaz.',
    skill: 'Dinleme',
  },
  'fill-blank': {
    id: 'fill-blank',
    name: 'Boşluk doldurma',
    description: 'Cümledeki eksik kelimeyi tamamla.',
    skill: 'Bağlam',
    needsExample: true,
  },
  speaking: {
    id: 'speaking',
    name: 'Konuşma',
    description: 'Kelimeyi sesli söyle, telaffuzunu kontrol et.',
    skill: 'Telaffuz',
    needsSpeech: true,
  },
};

export function isStudyMode(value: unknown): value is StudyMode {
  return typeof value === 'string' && (STUDY_MODES as readonly string[]).includes(value);
}

// ── Study sources ──
// daily            → due reviews + new words picked for the user
// weak             → words the user keeps getting wrong
// list:<id>        → a user list
// category:<name>  → a library category (system words)
export type StudySource =
  | { kind: 'daily' }
  | { kind: 'weak' }
  | { kind: 'list'; id: string }
  | { kind: 'category'; name: string };

export function parseSource(raw: string | null | undefined): StudySource {
  if (!raw || raw === 'daily') return { kind: 'daily' };
  if (raw === 'weak') return { kind: 'weak' };
  if (raw.startsWith('list:') && raw.length > 5) return { kind: 'list', id: raw.slice(5) };
  if (raw.startsWith('category:') && raw.length > 9) return { kind: 'category', name: raw.slice(9) };
  return { kind: 'daily' };
}

export function serializeSource(source: StudySource): string {
  switch (source.kind) {
    case 'list':
      return `list:${source.id}`;
    case 'category':
      return `category:${source.name}`;
    default:
      return source.kind;
  }
}

export const SESSION_SIZES = [5, 10, 15, 20] as const;
export const DEFAULT_SESSION_SIZE = 10;
