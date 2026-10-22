'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn, shuffle } from '@/lib/utils';
import { Kbd } from '@/components/ui/misc';
import { Example, FeedbackBar, ListenButton, ModeFrame, WordMeta } from '../parts';
import { speak } from '../speech';
import type { ModeProps, StudyCard, Distractor } from '../types';

type Direction = 'en-tr' | 'tr-en';

function buildOptions(card: StudyCard, deck: StudyCard[], distractors: Distractor[], direction: Direction) {
  const key = direction === 'en-tr' ? 'turkishTranslation' : 'word';
  const answer = card[key];
  const seen = new Set([answer.toLocaleLowerCase('tr-TR')]);
  // Same part of speech first (makes the options plausible), each group shuffled on its own.
  const pool = [
    ...shuffle([...deck.filter((c) => c.id !== card.id && c.type === card.type), ...distractors.filter((d) => d.type === card.type)]),
    ...shuffle([...deck.filter((c) => c.id !== card.id), ...distractors]),
  ];
  const wrong: string[] = [];
  for (const item of pool) {
    const value = item[key];
    const norm = value.toLocaleLowerCase('tr-TR');
    if (!seen.has(norm)) {
      seen.add(norm);
      wrong.push(value);
    }
    if (wrong.length === 3) break;
  }
  return shuffle([answer, ...wrong]);
}

export function MultipleChoiceMode({ card, deck, distractors, onAnswer, onNext }: ModeProps) {
  // ~70% English→Turkish; derived from the id so it is stable across renders.
  const direction: Direction = useMemo(() => ([...card.id].reduce((h, c) => h + c.charCodeAt(0), 0) % 10 < 7 ? 'en-tr' : 'tr-en'), [card.id]);
  const options = useMemo(() => buildOptions(card, deck, distractors, direction), [card, deck, distractors, direction]);
  const answer = direction === 'en-tr' ? card.turkishTranslation : card.word;
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;

  const pick = useCallback(
    (option: string) => {
      if (picked) return;
      setPicked(option);
      onAnswer(card.id, option === answer);
      speak(card.word);
    },
    [picked, answer, card.id, card.word, onAnswer],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (!picked && i >= 0 && i < options.length) pick(options[i]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, pick, picked]);

  return (
    <ModeFrame>
      <p className="text-center text-sm font-medium text-muted">
        {direction === 'en-tr' ? 'Bu kelimenin anlamı ne?' : 'Bunun İngilizcesi hangisi?'}
      </p>
      <div className="mt-6 flex flex-col items-center text-center">
        {direction === 'en-tr' ? (
          <>
            <div className="flex items-center gap-3">
              <h2 className="break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{card.word}</h2>
              <ListenButton text={card.word} />
            </div>
            {card.pronunciation && <p className="mt-2 font-mono text-sm text-muted">{card.pronunciation}</p>}
          </>
        ) : (
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{card.turkishTranslation}</h2>
        )}
        <WordMeta card={card} className="mt-3" />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isAnswer = option === answer;
          const isPicked = option === picked;
          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              disabled={!!picked}
              className={cn(
                'flex min-h-16 items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 text-left text-[16px] font-semibold transition',
                !picked && 'border-border hover:border-primary hover:bg-primary-soft/40 active:scale-[0.99]',
                picked && isAnswer && 'border-success bg-success-soft text-success',
                picked && isPicked && !isAnswer && 'animate-shake border-danger bg-danger-soft text-danger',
                picked && !isAnswer && !isPicked && 'border-border opacity-50',
              )}
            >
              <Kbd className="hidden sm:inline-flex">{i + 1}</Kbd>
              <span className="min-w-0 flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      {picked && (
        <FeedbackBar correct={correct} title={correct ? 'Doğru!' : 'Olmadı'} onContinue={onNext}>
          {!correct && (
            <p>
              Doğru cevap: <strong>{answer}</strong>
            </p>
          )}
          <p className="text-muted">
            <strong className="text-fg">{card.word}</strong> — {card.turkishTranslation}
          </p>
          {card.exampleSentence && (
            <div className="mt-2 hidden sm:block">
              <Example sentence={card.exampleSentence} word={card.word} />
            </div>
          )}
        </FeedbackBar>
      )}
    </ModeFrame>
  );
}
