import { describe, expect, it } from 'vitest';
import { parsePairs } from './import-parse';

describe('parsePairs', () => {
  it('understands common separators', () => {
    const rows = parsePairs('resilient - dayanıklı\nabandon: terk etmek\nthorough;titiz;She is thorough.\ncat\tkedi\nbook, kitap');
    expect(rows.map((r) => [r.word, r.turkishTranslation])).toEqual([
      ['resilient', 'dayanıklı'],
      ['abandon', 'terk etmek'],
      ['thorough', 'titiz'],
      ['cat', 'kedi'],
      ['book', 'kitap'],
    ]);
    expect(rows[2].exampleSentence).toBe('She is thorough.');
  });

  it('keeps multi-word phrases and commas inside meanings', () => {
    const [row] = parsePairs('give up - vazgeçmek, bırakmak');
    expect(row.word).toBe('give up');
    expect(row.turkishTranslation).toBe('vazgeçmek, bırakmak');
  });

  it('skips blank lines, lines without a meaning and duplicates', () => {
    const rows = parsePairs('\nhello - merhaba\nlonely\nHello - selam\n');
    expect(rows).toHaveLength(1);
  });
});
