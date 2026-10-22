export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const CEFR_INFO: Record<CefrLevel, { label: string; description: string }> = {
  A1: { label: 'Başlangıç', description: 'Temel kelimeler ve kalıplar' },
  A2: { label: 'Temel', description: 'Günlük hayatın kelimeleri' },
  B1: { label: 'Orta', description: 'Rahatça sohbet edebilirsin' },
  B2: { label: 'Orta üstü', description: 'İş ve akademik metinler' },
  C1: { label: 'İleri', description: 'Akıcı ve nüanslı kullanım' },
  C2: { label: 'Uzman', description: 'Ana dile yakın hâkimiyet' },
};

export function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === 'string' && (CEFR_LEVELS as readonly string[]).includes(value);
}

export const CATEGORIES = ['Temel', 'Genel', 'İş', 'Akademik', 'Teknoloji', 'Seyahat', 'Sağlık'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<string, { label: string; description: string }> = {
  Temel: { label: 'Temel', description: 'Her gün kullanılan ilk kelimeler' },
  Genel: { label: 'Genel', description: 'Okuma ve sohbette sık geçenler' },
  İş: { label: 'İş & Kariyer', description: 'Toplantı, e-posta ve ofis dili' },
  Akademik: { label: 'Akademik', description: 'Makale, sınav ve sunum dili' },
  Teknoloji: { label: 'Teknoloji', description: 'Yazılım ve dijital dünya' },
  Seyahat: { label: 'Seyahat', description: 'Havalimanı, otel ve şehir' },
  Sağlık: { label: 'Sağlık', description: 'Doktor, beden ve iyi yaşam' },
};

export const WORD_TYPES = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'conjunction', 'pronoun'] as const;

export const WORD_TYPE_LABELS: Record<string, string> = {
  noun: 'isim',
  verb: 'fiil',
  adjective: 'sıfat',
  adverb: 'zarf',
  phrase: 'kalıp',
  preposition: 'edat',
  conjunction: 'bağlaç',
  pronoun: 'zamir',
};

export function wordTypeLabel(type: string) {
  return WORD_TYPE_LABELS[type] ?? type;
}

export const DAILY_GOAL_OPTIONS = [
  { value: 5, label: 'Hafif', minutes: 3 },
  { value: 10, label: 'Düzenli', minutes: 6 },
  { value: 20, label: 'Ciddi', minutes: 12 },
  { value: 30, label: 'Yoğun', minutes: 18 },
] as const;

export const SITE = {
  name: 'VocabMaster',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vocabmaster.app',
  supportEmail: 'info@vocabmaster.app',
} as const;
