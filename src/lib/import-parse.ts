// Parsing for the list importer (kept separate so it can be unit-tested).

export interface ImportRow {
  word: string;
  turkishTranslation: string;
  exampleSentence: string;
  include: boolean;
}

const MAX_ROWS = 500;

/** "word - meaning", "word: meaning", "word;meaning", "word<TAB>meaning", "word,meaning" */
export function parsePairs(text: string): ImportRow[] {
  const rows: ImportRow[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(.+?)\s*(?:\t|;|\s[-–—=:]\s|:\s*|,\s*)\s*(.+)$/);
    if (!m) continue;
    const [, word, rest] = m;
    const [meaning, example = ''] = rest.split(/\t|;/).map((s) => s.trim());
    if (word && meaning) rows.push({ word: word.trim(), turkishTranslation: meaning, exampleSentence: example, include: true });
  }
  return dedupe(rows);
}

export function dedupe(rows: ImportRow[]) {
  const seen = new Set<string>();
  return rows
    .filter((r) => {
      const key = r.word.toLocaleLowerCase('en-US');
      if (!r.word || !r.turkishTranslation || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_ROWS);
}
