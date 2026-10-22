// [word, IPA, type, CEFR level, Turkish meaning, Turkish definition, example sentence, example translation]
export type WordEntry = [
  word: string,
  ipa: string,
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'preposition' | 'conjunction' | 'pronoun',
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  turkish: string,
  definition: string,
  example: string,
  exampleTr: string,
];
