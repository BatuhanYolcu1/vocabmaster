'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Snail, Volume2 } from 'lucide-react';
import { checkTypedAnswer, cn, type AnswerVerdict } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Example, FeedbackBar, ListenButton, ModeFrame, WordMeta } from '../parts';
import { speak, canSpeak } from '../speech';
import type { ModeProps } from '../types';

type Variant = 'typing' | 'listening' | 'fill-blank';

/** Splits the example sentence around the first word that starts with the target word. */
function blankSentence(sentence: string, word: string) {
  const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\b${escaped}[\\w'’-]*`, 'i').exec(sentence);
  if (!match) return null;
  return {
    before: sentence.slice(0, match.index),
    token: match[0],
    after: sentence.slice(match.index + match[0].length),
  };
}

export function TypedMode({ card, onAnswer, onNext, variant }: ModeProps & { variant: Variant }) {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<AnswerVerdict | null>(null);
  const [hints, setHints] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const blank = useMemo(
    () => (variant === 'fill-blank' ? blankSentence(card.exampleSentence, card.word) : null),
    [variant, card.exampleSentence, card.word],
  );
  // For fill-in-the-blank the sentence may use an inflected form ("decided"); accept both.
  const expected = blank?.token ?? card.word;

  useEffect(() => {
    inputRef.current?.focus();
    if (variant === 'listening') {
      const t = setTimeout(() => speak(card.word, { rate: 0.85 }), 300);
      return () => clearTimeout(t);
    }
  }, [variant, card.word]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (verdict || !value.trim()) return;
    let v = checkTypedAnswer(value, expected);
    if (v === 'wrong' && blank) {
      const base = checkTypedAnswer(value, card.word);
      if (base !== 'wrong') v = base;
    }
    setVerdict(v);
    onAnswer(card.id, v !== 'wrong');
    if (variant !== 'listening') speak(card.word);
  }

  function giveUp() {
    if (verdict) return;
    setVerdict('wrong');
    onAnswer(card.id, false);
    speak(card.word);
  }

  const hintText = expected.slice(0, Math.min(hints, expected.length - 1));

  return (
    <ModeFrame>
      <p className="text-center text-sm font-medium text-muted">
        {variant === 'typing' && 'İngilizcesini yaz'}
        {variant === 'listening' && 'Duyduğun kelimeyi yaz'}
        {variant === 'fill-blank' && 'Boşluğa gelen kelimeyi yaz'}
      </p>

      <div className="mt-6 text-center">
        {variant === 'typing' && (
          <>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{card.turkishTranslation}</h2>
            {card.definitionTr && <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{card.definitionTr}</p>}
            <WordMeta card={card} className="mt-3" />
          </>
        )}
        {variant === 'listening' && (
          <div className="flex items-center justify-center gap-3">
            <ListenButton text={card.word} rate={0.85} size="lg" label="Tekrar dinle" />
            {canSpeak() && (
              <button
                type="button"
                onClick={() => speak(card.word, { rate: 0.5 })}
                className="flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted hover:text-fg"
              >
                <Snail className="size-4" /> Yavaş
              </button>
            )}
          </div>
        )}
        {variant === 'fill-blank' && blank && (
          <div className="rounded-2xl border border-border bg-surface p-5 text-left shadow-sm sm:p-6">
            <p className="text-xl leading-relaxed text-fg sm:text-2xl">
              {blank.before}
              <span
                className={cn(
                  'mx-0.5 inline-block min-w-24 border-b-2 text-center font-semibold',
                  verdict ? (verdict === 'wrong' ? 'border-danger text-danger' : 'border-success text-success') : 'border-primary text-primary',
                )}
              >
                {verdict ? blank.token : ' '}
              </span>
              {blank.after}
            </p>
            {card.exampleSentenceTr && <p className="mt-3 text-sm text-muted">{card.exampleSentenceTr}</p>}
            <p className="mt-3 text-sm">
              İpucu: <span className="font-semibold text-fg">{card.turkishTranslation}</span>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-8">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!!verdict}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          lang="en"
          aria-label="Cevabın"
          placeholder={hintText ? `${hintText}…` : 'Cevabını yaz'}
          className={cn(
            'h-16 w-full rounded-2xl border-2 bg-surface px-5 text-center text-2xl font-semibold tracking-tight text-fg shadow-sm transition placeholder:font-normal placeholder:text-subtle focus:outline-none',
            !verdict && 'border-border focus:border-primary',
            verdict === 'correct' && 'border-success bg-success-soft',
            verdict === 'almost' && 'border-success bg-success-soft',
            verdict === 'wrong' && 'animate-shake border-danger bg-danger-soft',
          )}
        />
        {!verdict && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHints((h) => h + 1);
                  inputRef.current?.focus();
                }}
                disabled={hints >= expected.length - 1}
              >
                <Lightbulb /> İpucu
              </Button>
              <Button variant="ghost" size="sm" onClick={giveUp}>
                Bilmiyorum
              </Button>
            </div>
            <Button type="submit" size="lg" disabled={!value.trim()} className="min-w-32">
              Kontrol et
            </Button>
          </div>
        )}
      </form>

      {verdict && (
        <FeedbackBar
          correct={verdict !== 'wrong'}
          title={verdict === 'correct' ? 'Mükemmel!' : verdict === 'almost' ? 'Doğru, küçük bir yazım hatası' : 'Doğru cevap'}
          onContinue={onNext}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold">{expected}</span>
            <button type="button" onClick={() => speak(card.word)} aria-label="Dinle" className="text-muted hover:text-fg">
              <Volume2 className="size-4" />
            </button>
            <span className="text-muted">— {card.turkishTranslation}</span>
          </div>
          {variant !== 'fill-blank' && card.exampleSentence && (
            <div className="mt-2 hidden sm:block">
              <Example sentence={card.exampleSentence} word={card.word} />
            </div>
          )}
        </FeedbackBar>
      )}
    </ModeFrame>
  );
}
