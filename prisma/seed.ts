// Seeds the curated library words and the achievement definitions.
// Safe to run any number of times, including against production:
// - words are matched by seedKey, or (for rows created by older seeds) by word + category,
//   and updated in place, so users' progress on them is kept
// - nothing is ever deleted
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENTS } from '../src/lib/achievement-defs';
import type { WordEntry } from './words/types';
import { temel } from './words/temel';
import { genel } from './words/genel';
import { is } from './words/is';
import { akademik } from './words/akademik';
import { teknoloji } from './words/teknoloji';
import { seyahat } from './words/seyahat';
import { saglik } from './words/saglik';

const prisma = new PrismaClient();

const LIBRARY: Record<string, WordEntry[]> = {
  Temel: temel,
  Genel: genel,
  İş: is,
  Akademik: akademik,
  Teknoloji: teknoloji,
  Seyahat: seyahat,
  Sağlık: saglik,
};

function containsWord(sentence: string, word: string) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(sentence);
}

async function seedWords() {
  let created = 0;
  let updated = 0;
  const problems: string[] = [];

  for (const [category, entries] of Object.entries(LIBRARY)) {
    for (const [word, ipa, type, level, turkish, definition, example, exampleTr] of entries) {
      if (!containsWord(example, word)) problems.push(`${category}/${word}: example does not contain the word`);

      const seedKey = `${category}:${word}`.toLowerCase();
      const data = {
        word,
        pronunciation: ipa,
        type,
        level,
        category,
        turkishTranslation: turkish,
        definitionTr: definition,
        exampleSentence: example,
        exampleSentenceTr: exampleTr,
        isSystem: true,
        seedKey,
      };

      const existing =
        (await prisma.word.findFirst({ where: { seedKey }, select: { id: true } })) ??
        (await prisma.word.findFirst({
          where: { isSystem: true, seedKey: null, category, word: { equals: word, mode: 'insensitive' } },
          select: { id: true },
        }));

      if (existing) {
        await prisma.word.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.word.create({ data });
        created++;
      }
    }
  }

  console.log(`Words: ${created} created, ${updated} updated`);
  if (problems.length) console.warn(`⚠ ${problems.length} content issue(s):\n  ${problems.join('\n  ')}`);
}

async function seedAchievements() {
  for (const def of ACHIEVEMENTS) {
    const data = {
      nameTr: def.nameTr,
      description: def.description,
      descriptionTr: def.descriptionTr,
      icon: def.icon,
      xpReward: def.xpReward,
      condition: JSON.stringify({ metric: def.metric, target: def.target }),
    };
    await prisma.achievement.upsert({ where: { name: def.name }, update: data, create: { name: def.name, ...data } });
  }
  console.log(`Achievements: ${ACHIEVEMENTS.length} synced`);
}

async function main() {
  await seedWords();
  await seedAchievements();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
