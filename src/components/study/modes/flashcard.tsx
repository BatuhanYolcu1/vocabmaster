'use client';

import { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn, formatMinutes } from '@/lib/utils';
import { schedule, type Rating } from '@/lib/srs';
import { Kbd } from '@/components/ui/misc';
import { Example, ListenButton, ModeFrame, WordMeta } from '../parts';
import { speak } from '../speech';
import type { ModeProps } from '../types';

const RATINGS: Array<{ rating: Rating; label: string; key: string; className: string }> = [
  { rating: 'hard', label: 'Bilemedim', key: '1', className: 'border-danger/30 bg-danger-soft text-danger hover:border-danger/60' },
  { rating: 'good', label: 'Bildim', key: '2', className: 'border-primary/30 bg-primary-soft text-primary-soft-fg hover:border-primary/60' },
  { rating: 'easy', label: 'Çok kolay', key: '3', className: 'border-success/30 bg-success-soft text-success hover:border-success/60' },
];

export function FlashcardMode({ card, onAnswer, onNext }: ModeProps) {
  const [flipped, setFlipped] = useState(false);

  const rate = useCallback(
    (rating: Rating) => {
      onAnswer(card.id, rating !== 'hard', rating);
      onNext();
    },
    [card.id, onAnswer, onNext],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (!flipped) setFlipped(true);
      } else if (flipped && ['1', '2', '3'].includes(e.key)) {
        rate(RATINGS[Number(e.key) - 1].rating);
      } else if (e.key.toLowerCase() === 'p') {
        speak(card.word);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, rate, card.word]);

  return (
    <ModeFrame className="pb-10">
      <div className="perspective w-full">
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Kartın arka yüzü' : 'Kartı çevirmek için tıkla'}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          className={cn(
            'preserve-3d relative min-h-[22rem] w-full transition-transform duration-500 sm:min-h-[24rem]',
            flipped && 'rotate-y-180',
          )}
        >
          {/* Front */}
          <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center shadow-md">
            <WordMeta card={card} />
            <h2 className="mt-4 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{card.word}</h2>
            {card.pronunciation && <p className="mt-2 font-mono text-sm text-muted">{card.pronunciation}</p>}
            <ListenButton text={card.word} className="mt-6" />
            <p className="absolute bottom-5 flex items-center gap-1.5 text-xs text-subtle">
              <RotateCcw className="size-3.5" /> Çevirmek için dokun <Kbd className="hidden sm:inline-flex">Boşluk</Kbd>
            </p>
          </div>
          {/* Back */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-md sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-fg">{card.word}</p>
                {card.pronunciation && <p className="font-mono text-xs text-muted">{card.pronunciation}</p>}
              </div>
              <ListenButton text={card.word} />
            </div>
            <p className="mt-5 font-display text-3xl font-extrabold leading-tight text-primary">{card.turkishTranslation}</p>
            {card.definitionTr && <p className="mt-2 text-[15px] text-muted">{card.definitionTr}</p>}
            {card.exampleSentence && (
              <div className="mt-auto border-t border-border pt-4">
                <Example sentence={card.exampleSentence} translation={card.exampleSentenceTr} word={card.word} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-24">
        {flipped ? (
          <div className="animate-fade-in">
            <p className="mb-3 text-center text-sm text-muted">Ne kadar iyi biliyordun?</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {RATINGS.map(({ rating, label, key, className }) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => rate(rating)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition active:scale-[0.97]',
                    className,
                  )}
                >
                  <span className="text-[15px] font-bold">{label}</span>
                  <span className="flex items-center gap-1.5 text-xs opacity-80">
                    {formatMinutes(schedule(card.srs, rating).interval)} sonra
                    <Kbd className="hidden border-current/30 bg-transparent text-current sm:inline-flex">{key}</Kbd>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-fg shadow-sm transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Cevabı göster
          </button>
        )}
      </div>
    </ModeFrame>
  );
}
