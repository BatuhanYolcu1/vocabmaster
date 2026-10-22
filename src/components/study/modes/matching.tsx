'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn, shuffle } from '@/lib/utils';
import { ModeFrame } from '../parts';
import { speak } from '../speech';
import type { MatchingProps } from '../types';

type Side = 'en' | 'tr';

export function MatchingMode({ cards, onAnswer, onRoundDone }: MatchingProps) {
  const left = useMemo(() => shuffle(cards), [cards]);
  const right = useMemo(() => shuffle(cards), [cards]);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string[]>([]);
  // A word counts as correct only if it was matched without a mistake.
  const missed = useRef(new Set<string>());
  const reported = useRef(new Set<string>());

  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0) {
      const t = setTimeout(onRoundDone, 650);
      return () => clearTimeout(t);
    }
  }, [matched, cards.length, onRoundDone]);

  function choose(side: Side, id: string) {
    if (matched.has(id)) return;
    if (side === 'en') speak(cards.find((c) => c.id === id)?.word ?? '');
    if (!selected || selected.side === side) {
      setSelected({ side, id });
      return;
    }
    const enId = side === 'en' ? id : selected.id;
    const trId = side === 'tr' ? id : selected.id;
    if (enId === trId) {
      setMatched((m) => new Set(m).add(enId));
      if (!reported.current.has(enId)) {
        reported.current.add(enId);
        onAnswer(enId, !missed.current.has(enId));
      }
    } else {
      missed.current.add(enId);
      missed.current.add(trId);
      setWrongFlash([enId + ':en', trId + ':tr']);
      setTimeout(() => setWrongFlash([]), 450);
    }
    setSelected(null);
  }

  const tile = (side: Side, id: string, text: string) => {
    const isMatched = matched.has(id);
    const isSelected = selected?.side === side && selected.id === id;
    const isWrong = wrongFlash.includes(`${id}:${side}`);
    return (
      <button
        key={`${side}-${id}`}
        type="button"
        onClick={() => choose(side, id)}
        disabled={isMatched}
        className={cn(
          'flex min-h-16 w-full items-center justify-center rounded-2xl border-2 bg-surface px-3 py-2 text-center text-[15px] font-semibold transition sm:text-base',
          !isMatched && !isSelected && !isWrong && 'border-border hover:border-border-strong active:scale-[0.98]',
          isSelected && 'border-primary bg-primary-soft text-primary-soft-fg',
          isWrong && 'animate-shake border-danger bg-danger-soft text-danger',
          isMatched && 'scale-95 border-success/40 bg-success-soft text-success opacity-60',
          side === 'en' && 'font-display',
        )}
      >
        {text}
      </button>
    );
  };

  return (
    <ModeFrame className="pb-10">
      <p className="text-center text-sm font-medium text-muted">Kelimeleri anlamlarıyla eşleştir</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3">{left.map((c) => tile('en', c.id, c.word))}</div>
        <div className="space-y-3">{right.map((c) => tile('tr', c.id, c.turkishTranslation))}</div>
      </div>
    </ModeFrame>
  );
}
