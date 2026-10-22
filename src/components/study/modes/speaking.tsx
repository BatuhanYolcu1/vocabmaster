'use client';

import { useState } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn, editDistance, normalizeAnswer } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Example, FeedbackBar, ListenButton, ModeFrame, WordMeta } from '../parts';
import { useSpeechRecognition, type RecognitionError } from '../speech';
import type { ModeProps } from '../types';

const ERRORS: Record<RecognitionError, string> = {
  'not-allowed': 'Mikrofon izni verilmedi. Tarayıcının adres çubuğundan mikrofon iznini açabilirsin.',
  'no-speech': 'Ses duyamadım. Mikrofona biraz daha yakın konuşmayı dene.',
  network: 'Konuşma tanıma servisine ulaşılamadı. Bağlantını kontrol et.',
  other: 'Bir sorun oldu, tekrar dener misin?',
};

/** Accept when any recognition alternative is the word, or within a small edit distance. */
function matches(alternatives: string[], word: string) {
  const target = normalizeAnswer(word);
  const tolerance = target.length >= 7 ? 2 : target.length >= 4 ? 1 : 0;
  return alternatives.some((alt) => {
    const said = normalizeAnswer(alt);
    if (said === target) return true;
    if (said.split(' ').includes(target)) return true;
    return editDistance(said, target) <= tolerance;
  });
}

export function SpeakingMode({ card, onAnswer, onNext }: ModeProps) {
  const { supported, listening, interim, listen, stop } = useSpeechRecognition();
  const [result, setResult] = useState<{ correct: boolean; heard: string } | null>(null);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  function start() {
    setError('');
    listen(
      (alternatives) => {
        const ok = matches(alternatives, card.word);
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        // Two tries before it counts as a miss.
        if (ok || nextAttempts >= 2) {
          setResult({ correct: ok, heard: alternatives[0] ?? '' });
          onAnswer(card.id, ok);
        } else {
          setError(`“${alternatives[0]}” duydum. Bir kez daha dene!`);
        }
      },
      (e) => setError(ERRORS[e]),
    );
  }

  if (supported === false) {
    return (
      <ModeFrame>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
          <MicOff className="mx-auto size-8 text-muted" />
          <p className="mt-3 font-semibold">Tarayıcın konuşma tanımayı desteklemiyor</p>
          <p className="mt-1 text-sm text-muted">Bu mod için Chrome, Edge ya da Safari’nin güncel sürümünü kullan. Şimdilik bu kelimeyi atlayabilirsin.</p>
          <Button className="mt-5" onClick={onNext}>
            Atla
          </Button>
        </div>
      </ModeFrame>
    );
  }

  return (
    <ModeFrame>
      <p className="text-center text-sm font-medium text-muted">Kelimeyi sesli söyle</p>
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <h2 className="break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{card.word}</h2>
          <ListenButton text={card.word} />
        </div>
        {card.pronunciation && <p className="mt-2 font-mono text-sm text-muted">{card.pronunciation}</p>}
        <p className="mt-2 text-muted">{card.turkishTranslation}</p>
        <WordMeta card={card} className="mt-3" />
      </div>

      {!result && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={listening ? stop : start}
            aria-label={listening ? 'Dinlemeyi durdur' : 'Konuşmaya başla'}
            className={cn(
              'relative grid size-24 place-items-center rounded-full text-white shadow-lg transition active:scale-95',
              listening ? 'bg-danger' : 'bg-primary hover:bg-primary-hover',
            )}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" aria-hidden />}
            {listening ? <Square className="relative size-8 fill-current" /> : <Mic className="size-10" />}
          </button>
          <p className="min-h-6 text-sm text-muted" aria-live="polite">
            {listening ? interim || 'Dinliyorum…' : 'Mikrofona dokun ve söyle'}
          </p>
          {error && <p className="max-w-sm text-center text-sm font-medium text-danger">{error}</p>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stop();
              setResult({ correct: false, heard: '' });
              onAnswer(card.id, false);
            }}
          >
            Şu an konuşamıyorum, atla
          </Button>
        </div>
      )}

      {result && (
        <FeedbackBar correct={result.correct} title={result.correct ? 'Telaffuzun harika!' : 'Bir dahaki sefere'} onContinue={onNext}>
          {result.heard && (
            <p className="text-muted">
              Duyduğum: <span className="font-semibold text-fg">“{result.heard}”</span>
            </p>
          )}
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
