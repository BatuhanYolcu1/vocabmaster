'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice !== undefined && cachedVoice !== null) return cachedVoice;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  const preferred = ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Alex'];
  cachedVoice =
    preferred.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices[0] ??
    null;
  return cachedVoice;
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, opts: { rate?: number } = {}) {
  if (!canSpeak() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = opts.rate ?? 0.9;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  synth.speak(u);
}

// Voices load asynchronously in Chrome.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
    pickVoice();
  };
}

// ── Speech recognition ──

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type RecognitionError = 'not-allowed' | 'no-speech' | 'network' | 'other';

export function useSpeechRecognition() {
  const [supported] = useState<boolean | null>(() => (typeof window === 'undefined' ? null : getRecognitionCtor() !== null));
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const ref = useRef<Recognition | null>(null);

  useEffect(() => () => ref.current?.abort(), []);

  const listen = useCallback(
    (onFinal: (alternatives: string[]) => void, onError: (e: RecognitionError) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;
      ref.current?.abort();
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      let delivered = false;
      rec.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        setInterim(last[0]?.transcript ?? '');
        if (last.isFinal && !delivered) {
          delivered = true;
          onFinal(Array.from(last, (alt) => alt.transcript));
        }
      };
      rec.onerror = (e) => {
        const map: Record<string, RecognitionError> = {
          'not-allowed': 'not-allowed',
          'service-not-allowed': 'not-allowed',
          'no-speech': 'no-speech',
          network: 'network',
        };
        if (e.error !== 'aborted') onError(map[e.error] ?? 'other');
      };
      rec.onend = () => {
        setListening(false);
        if (!delivered) setInterim('');
      };
      ref.current = rec;
      setInterim('');
      setListening(true);
      rec.start();
    },
    [],
  );

  const stop = useCallback(() => ref.current?.stop(), []);

  return { supported, listening, interim, listen, stop };
}
