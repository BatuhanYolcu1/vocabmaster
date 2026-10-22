import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { notFound, badRequest } from './api';
import { LEARNED_INTERVAL, cardStage } from '@/lib/srs';
import type { WordInput } from '@/lib/schemas';

export async function getListSummaries(userId: string) {
  const lists = await prisma.wordList.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, description: true, updatedAt: true, items: { select: { wordId: true } } },
  });
  const wordIds = [...new Set(lists.flatMap((l) => l.items.map((i) => i.wordId)))];
  const progress = wordIds.length
    ? await prisma.progress.findMany({
        where: { userId, wordId: { in: wordIds } },
        select: { wordId: true, interval: true, nextReview: true },
      })
    : [];
  const byWord = new Map(progress.map((p) => [p.wordId, p]));
  const now = Date.now();

  return lists.map((l) => {
    let studied = 0;
    let learned = 0;
    let due = 0;
    for (const { wordId } of l.items) {
      const p = byWord.get(wordId);
      if (!p) continue;
      studied++;
      if (p.interval >= LEARNED_INTERVAL) learned++;
      if (p.nextReview.getTime() <= now) due++;
    }
    return {
      id: l.id,
      name: l.name,
      description: l.description,
      updatedAt: l.updatedAt.toISOString(),
      count: l.items.length,
      studied,
      learned,
      due,
    };
  });
}

export type ListSummary = Awaited<ReturnType<typeof getListSummaries>>[number];

export async function getListDetail(userId: string, listId: string) {
  const list = await prisma.wordList.findFirst({
    where: { id: listId, userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      items: {
        orderBy: { createdAt: 'asc' },
        select: {
          word: {
            select: {
              id: true,
              word: true,
              turkishTranslation: true,
              definitionTr: true,
              exampleSentence: true,
              exampleSentenceTr: true,
              type: true,
              level: true,
              pronunciation: true,
              isSystem: true,
              createdByUserId: true,
              progress: {
                where: { userId },
                select: { interval: true, reviewCount: true, nextReview: true, correctCount: true, wrongCount: true },
              },
            },
          },
        },
      },
    },
  });
  if (!list) return null;

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    words: list.items.map(({ word }) => {
      const p = word.progress[0];
      return {
        id: word.id,
        word: word.word,
        turkishTranslation: word.turkishTranslation,
        definitionTr: word.definitionTr,
        exampleSentence: word.exampleSentence,
        exampleSentenceTr: word.exampleSentenceTr,
        type: word.type,
        level: word.level,
        pronunciation: word.pronunciation,
        editable: !word.isSystem && word.createdByUserId === userId,
        stage: cardStage(p),
        nextReview: p?.nextReview.toISOString() ?? null,
        accuracy: p && p.correctCount + p.wrongCount > 0 ? Math.round((p.correctCount / (p.correctCount + p.wrongCount)) * 100) : null,
      };
    }),
  };
}

export type ListDetail = NonNullable<Awaited<ReturnType<typeof getListDetail>>>;
export type ListWord = ListDetail['words'][number];

/** Adds new custom words and/or existing library words to a list; skips duplicates. */
export async function addWordsToList(
  tx: Prisma.TransactionClient,
  userId: string,
  listId: string,
  words: WordInput[],
  wordIds: string[],
) {
  const list = await tx.wordList.findFirst({ where: { id: listId, userId }, select: { id: true } });
  if (!list) throw notFound('Liste bulunamadı.');

  const existing = await tx.wordListItem.findMany({
    where: { wordListId: listId },
    select: { wordId: true, word: { select: { word: true } } },
  });
  const existingIds = new Set(existing.map((e) => e.wordId));
  const existingTexts = new Set(existing.map((e) => e.word.word.toLocaleLowerCase('en-US')));

  let added = 0;
  let skipped = 0;

  if (wordIds.length) {
    const allowed = await tx.word.findMany({
      where: { id: { in: wordIds }, OR: [{ isSystem: true }, { createdByUserId: userId }] },
      select: { id: true, word: true },
    });
    const fresh = allowed.filter((w) => !existingIds.has(w.id));
    skipped += wordIds.length - fresh.length;
    if (fresh.length) {
      await tx.wordListItem.createMany({ data: fresh.map((w) => ({ wordListId: listId, wordId: w.id })), skipDuplicates: true });
      fresh.forEach((w) => existingTexts.add(w.word.toLocaleLowerCase('en-US')));
      added += fresh.length;
    }
  }

  for (const input of words) {
    const key = input.word.toLocaleLowerCase('en-US');
    if (existingTexts.has(key)) {
      skipped++;
      continue;
    }
    existingTexts.add(key);
    const word = await tx.word.create({
      data: {
        word: input.word,
        turkishTranslation: input.turkishTranslation,
        definitionTr: input.definitionTr ?? '',
        exampleSentence: input.exampleSentence ?? '',
        exampleSentenceTr: input.exampleSentenceTr ?? '',
        type: input.type ?? 'noun',
        pronunciation: input.pronunciation || null,
        level: 'B1',
        category: 'Kişisel',
        isSystem: false,
        createdByUserId: userId,
      },
      select: { id: true },
    });
    await tx.wordListItem.create({ data: { wordListId: listId, wordId: word.id } });
    added++;
  }

  if (added) await tx.wordList.update({ where: { id: listId }, data: { updatedAt: new Date() } });
  if (added === 0 && skipped > 0 && words.length + wordIds.length > 0) {
    throw badRequest('Bu kelimelerin hepsi zaten listede.', 'ALL_DUPLICATES');
  }
  return { added, skipped };
}

/** Removes a word from a list. Custom words that belong to no other list are deleted. */
export async function removeWordFromList(userId: string, listId: string, wordId: string) {
  await prisma.$transaction(async (tx) => {
    const item = await tx.wordListItem.findFirst({
      where: { wordListId: listId, wordId, wordList: { userId } },
      select: { id: true, word: { select: { isSystem: true, createdByUserId: true } } },
    });
    if (!item) throw notFound('Kelime bu listede değil.');
    await tx.wordListItem.delete({ where: { id: item.id } });

    if (!item.word.isSystem && item.word.createdByUserId === userId) {
      const stillUsed = await tx.wordListItem.count({ where: { wordId } });
      if (stillUsed === 0) await tx.word.delete({ where: { id: wordId } });
    }
    await tx.wordList.update({ where: { id: listId }, data: { updatedAt: new Date() } });
  });
}

/** Deletes a list and the custom words that only lived in it. */
export async function deleteList(userId: string, listId: string) {
  await prisma.$transaction(async (tx) => {
    const list = await tx.wordList.findFirst({
      where: { id: listId, userId },
      select: { items: { select: { wordId: true } } },
    });
    if (!list) throw notFound('Liste bulunamadı.');
    const ids = list.items.map((i) => i.wordId);
    await tx.wordList.delete({ where: { id: listId } });
    if (ids.length) {
      await tx.word.deleteMany({
        where: { id: { in: ids }, isSystem: false, createdByUserId: userId, wordListItems: { none: {} } },
      });
    }
  });
}
