'use client';

import { useState } from 'react';
import { RotateCcw, Volume2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { speak } from '@/components/study/speech';

const WORDS = [
  { word: 'resilient', ipa: '/rɪˈzɪliənt/', type: 'sıfat', level: 'B2', tr: 'dayanıklı, çabuk toparlanan', ex: 'Kids are surprisingly resilient.' },
  { word: 'journey', ipa: '/ˈdʒɜːrni/', type: 'isim', level: 'A2', tr: 'yolculuk', ex: 'The journey took eight hours.' },
  { word: 'negotiate', ipa: '/nɪˈɡoʊʃieɪt/', type: 'fiil', level: 'B1', tr: 'pazarlık etmek, müzakere etmek', ex: 'Always negotiate your first offer.' },
];

const RATINGS = [
  { label: 'Bilemedim', hint: '1 dk', className: 'border-danger/30 bg-danger-soft text-danger' },
  { label: 'Bildim', hint: '10 dk', className: 'border-primary/30 bg-primary-soft text-primary-soft-fg' },
  { label: 'Çok kolay', hint: '4 g', className: 'border-success/30 bg-success-soft text-success' },
];

/** A self-contained, offline flashcard so visitors can feel the product. */
export function DemoCard() {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [xp, setXp] = useState(0);
  const [burst, setBurst] = useState(0);
  const w = WORDS[i % WORDS.length];

  function rate(idx: number) {
    setXp((x) => x + (idx === 0 ? 2 : 10));
    setBurst((b) => b + 1);
    setFlipped(false);
    setTimeout(() => setI((n) => n + 1), 180);
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center justify-between px-1 text-xs">
        <span className="font-semibold text-muted">Dene: karta dokun</span>
        <span key={burst} className="inline-flex items-center gap-1 rounded-full bg-xp-soft px-2.5 py-1 font-bold text-xp tabular animate-pop">
          <Zap className="size-3.5 fill-current" /> {xp} XP
        </span>
      </div>
      <div className="perspective">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          aria-label={flipped ? `${w.word}: ${w.tr}` : `Kartı çevir: ${w.word}`}
          className={cn('preserve-3d relative h-72 w-full transition-transform duration-500', flipped && 'rotate-y-180')}
        >
          <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-6 text-center shadow-lg">
            <span className="text-xs font-medium text-muted">
              {w.type} · <span className="font-mono">{w.level}</span>
            </span>
            <span className="mt-3 font-display text-5xl font-extrabold tracking-tight">{w.word}</span>
            <span className="mt-2 font-mono text-sm text-muted">{w.ipa}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speak(w.word);
              }}
              className="mt-5 grid size-10 place-items-center rounded-full bg-primary-soft text-primary-soft-fg"
              aria-label={`${w.word} dinle`}
            >
              <Volume2 className="size-5" />
            </button>
            <span className="absolute bottom-4 flex items-center gap-1.5 text-xs text-subtle">
              <RotateCcw className="size-3.5" /> çevir
            </span>
          </div>
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-center rounded-3xl border border-border bg-surface p-7 shadow-lg">
            <span className="font-display text-lg font-bold text-muted">{w.word}</span>
            <span className="mt-2 font-display text-3xl font-extrabold leading-tight text-primary">{w.tr}</span>
            <span className="mt-6 border-t border-border pt-4 text-[15px] text-fg">“{w.ex}”</span>
          </div>
        </div>
      </div>
      <div className={cn('mt-4 grid grid-cols-3 gap-2 transition-opacity', flipped ? 'opacity-100' : 'pointer-events-none opacity-0')} aria-hidden={!flipped}>
        {RATINGS.map((r, idx) => (
          <button
            key={r.label}
            type="button"
            tabIndex={flipped ? 0 : -1}
            onClick={() => rate(idx)}
            className={cn('rounded-2xl border-2 px-2 py-2.5 text-center transition active:scale-[0.97]', r.className)}
          >
            <span className="block text-sm font-bold">{r.label}</span>
            <span className="block text-[11px] opacity-80">{r.hint} sonra</span>
          </button>
        ))}
      </div>
    </div>
  );
}
