'use client';

import { useEffect } from 'react';
import { CheckCircle2, Volume2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { wordTypeLabel } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/misc';
import { LevelBadge } from '@/components/ui/badge';
import { speak, canSpeak } from './speech';
import type { StudyCard } from './types';

export function ListenButton({
  text,
  rate,
  size = 'md',
  label = 'Dinle',
  className,
}: {
  text: string;
  rate?: number;
  size?: 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, { rate });
      }}
      aria-label={`${label}: ${text}`}
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-primary-soft text-primary-soft-fg transition hover:brightness-95 active:scale-95 dark:hover:brightness-125',
        size === 'lg' ? 'size-16 [&_svg]:size-7' : 'size-10 [&_svg]:size-5',
        className,
      )}
    >
      <Volume2 />
    </button>
  );
}

export function WordMeta({ card, className }: { card: StudyCard; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted', className)}>
      <span className="font-medium">{wordTypeLabel(card.type)}</span>
      {card.level && card.category !== 'Kişisel' && <LevelBadge level={card.level} />}
    </div>
  );
}

/** Example sentence with the target word emphasised. */
export function Example({ sentence, translation, word }: { sentence: string; translation?: string; word: string }) {
  if (!sentence) return null;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = sentence.split(new RegExp(`(\\b${escaped}\\w*)`, 'i'));
  return (
    <div className="text-left">
      <p className="text-[15px] leading-relaxed text-fg">
        “
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <mark key={i} className="rounded bg-primary-soft px-0.5 font-semibold text-primary-soft-fg">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
        ”
      </p>
      {translation && <p className="mt-1 text-sm text-muted">{translation}</p>}
    </div>
  );
}

/** Bottom feedback sheet shown after an answer; Enter continues. */
export function FeedbackBar({
  correct,
  title,
  children,
  onContinue,
}: {
  correct: boolean;
  title: string;
  children?: React.ReactNode;
  onContinue: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        onContinue();
      }
    };
    // Defer so the Enter that submitted the answer doesn't also continue.
    const t = setTimeout(() => window.addEventListener('keydown', onKey), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onContinue]);

  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={cn(
        'safe-bottom fixed inset-x-0 bottom-0 z-20 animate-fade-in border-t',
        correct ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft',
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex min-w-0 flex-1 gap-3">
          <Icon className={cn('mt-0.5 size-7 shrink-0', correct ? 'text-success' : 'text-danger')} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className={cn('font-display text-lg font-extrabold', correct ? 'text-success' : 'text-danger')}>{title}</p>
            {children && <div className="mt-1 text-sm text-fg">{children}</div>}
          </div>
        </div>
        <Button size="lg" variant={correct ? 'success' : 'danger'} onClick={onContinue} className="w-full sm:w-auto sm:min-w-36" autoFocus>
          Devam <Kbd className="hidden border-white/30 bg-white/15 text-white sm:inline-flex">Enter</Kbd>
        </Button>
      </div>
    </div>
  );
}

export function ModeFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-48 pt-6 sm:px-6 sm:pt-10', className)}>{children}</div>;
}
