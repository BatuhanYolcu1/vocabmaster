'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Inbox, X, Zap } from 'lucide-react';
import { api, errorMessage } from '@/lib/fetcher';
import { STUDY_MODE_INFO, type StudyMode } from '@/lib/study-modes';
import type { Rating } from '@/lib/srs';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { FlashcardMode } from './modes/flashcard';
import { MultipleChoiceMode } from './modes/multiple-choice';
import { TypedMode } from './modes/typed';
import { MatchingMode } from './modes/matching';
import { SpeakingMode } from './modes/speaking';
import { SessionSummary, type SummaryData } from './summary';
import type { Distractor, StudyCard } from './types';
import type { AnswerResult } from '@/server/study';

interface QueueItem {
  card: StudyCard;
  attempt: number;
}

interface SessionResponse {
  sessionId: string | null;
  title: string;
  cards: StudyCard[];
  distractors: Distractor[];
}

const MATCH_ROUND = 5;

export function StudySession({ mode, source, size }: { mode: StudyMode; source: string; size: number }) {
  const router = useRouter();
  const toast = useToast();
  const info = STUDY_MODE_INFO[mode];

  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'running' | 'finishing' | 'done'>('loading');
  const [loadError, setLoadError] = useState('');
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState<StudyCard[]>([]);
  const [distractors, setDistractors] = useState<Distractor[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpBursts, setXpBursts] = useState<Array<{ id: number; amount: number }>>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);

  const pending = useRef<Promise<unknown>[]>([]);
  const requeued = useRef(new Set<string>());
  const burstId = useRef(0);
  const achievementsSeen = useRef<SummaryData['achievements']>([]);
  const failedSaves = useRef(0);
  // Mirrors of state read inside async callbacks (avoids stale closures).
  const queueRef = useRef<QueueItem[]>([]);
  const indexRef = useRef(0);
  const firstTryRef = useRef(new Map<string, boolean>());
  const deckRef = useRef<StudyCard[]>([]);
  const xpRef = useRef(0);
  const sessionRef = useRef<string | null>(null);

  const requestSession = useCallback(
    () => api<SessionResponse>('/api/study/session', { method: 'POST', body: { mode, source, size } }),
    [mode, source, size],
  );

  const applySession = useCallback(
    (data: SessionResponse) => {
      if (data.cards.length < (info.minWords ?? 1) || !data.sessionId) {
        setStatus('empty');
        return;
      }
      const initialQueue = data.cards.map((card) => ({ card, attempt: 0 }));
      sessionRef.current = data.sessionId;
      queueRef.current = initialQueue;
      indexRef.current = 0;
      firstTryRef.current = new Map();
      deckRef.current = data.cards;
      xpRef.current = 0;
      requeued.current.clear();
      achievementsSeen.current = [];
      setTitle(data.title);
      setDeck(data.cards);
      setDistractors(data.distractors);
      setQueue(initialQueue);
      setIndex(0);
      setXp(0);
      setStatus('running');
    },
    [info.minWords],
  );

  const applyError = useCallback((error: unknown) => {
    setLoadError(errorMessage(error));
    setStatus('error');
  }, []);

  useEffect(() => {
    requestSession().then(applySession, applyError);
  }, [requestSession, applySession, applyError]);

  const restart = useCallback(() => {
    setStatus('loading');
    setLoadError('');
    setSummary(null);
    requestSession().then(applySession, applyError);
  }, [requestSession, applySession, applyError]);

  const handleAnswer = useCallback(
    (cardId: string, correct: boolean, rating?: Rating) => {
      if (!firstTryRef.current.has(cardId)) {
        firstTryRef.current = new Map(firstTryRef.current).set(cardId, correct);
      }

      // Missed cards come back once at the end of the session (except in matching).
      if (!correct && mode !== 'matching' && !requeued.current.has(cardId)) {
        requeued.current.add(cardId);
        const item = queueRef.current.find((i) => i.card.id === cardId);
        if (item) {
          queueRef.current = [...queueRef.current, { card: item.card, attempt: item.attempt + 1 }];
          setQueue(queueRef.current);
        }
      }

      const send = async (retry: boolean): Promise<void> => {
        try {
          const res = await api<AnswerResult>('/api/study/answer', {
            method: 'POST',
            body: { sessionId: sessionRef.current, wordId: cardId, mode, correct, rating },
          });
          if (res.xp > 0) {
            xpRef.current += res.xp;
            setXp(xpRef.current);
            const id = ++burstId.current;
            setXpBursts((b) => [...b, { id, amount: res.xp }]);
            setTimeout(() => setXpBursts((b) => b.filter((x) => x.id !== id)), 1100);
          }
          if (res.achievements.length) {
            achievementsSeen.current = [...achievementsSeen.current, ...res.achievements];
            res.achievements.forEach((a) => toast.success(`Başarım açıldı: ${a.nameTr}`, `+${a.xpReward} XP`));
          }
        } catch (error) {
          if (retry) return send(false);
          failedSaves.current++;
          if (failedSaves.current === 1) toast.error('Cevap kaydedilemedi', errorMessage(error));
        }
      };
      pending.current.push(send(true));
    },
    [mode, toast],
  );

  const finish = useCallback(async () => {
    setStatus('finishing');
    await Promise.allSettled(pending.current);
    pending.current = [];
    try {
      const res = await api<Omit<SummaryData, 'firstTry' | 'cards'>>(`/api/study/session/${sessionRef.current}/complete`, { method: 'POST' });
      const known = new Set(achievementsSeen.current.map((a) => a.name));
      setSummary({
        ...res,
        achievements: [...achievementsSeen.current, ...res.achievements.filter((a) => !known.has(a.name))],
        cards: deckRef.current,
        firstTry: firstTryRef.current,
      });
      router.refresh(); // keep the shell's streak/XP in sync
    } catch {
      setSummary({
        total: firstTryRef.current.size,
        correct: [...firstTryRef.current.values()].filter(Boolean).length,
        xpEarned: xpRef.current,
        bonusXp: 0,
        durationMs: 0,
        totalXp: 0,
        level: 0,
        streak: 0,
        todayWords: 0,
        dailyGoal: 0,
        achievements: achievementsSeen.current,
        cards: deckRef.current,
        firstTry: firstTryRef.current,
      });
    }
    setStatus('done');
  }, [router]);

  const advance = useCallback(
    (by = 1) => {
      const next = indexRef.current + by;
      indexRef.current = next;
      setIndex(next);
      if (next >= queueRef.current.length) finish();
    },
    [finish],
  );

  // Esc → exit confirmation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'running') setConfirmExit(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

  const current = queue[index];
  const matchRound = useMemo(
    () => (mode === 'matching' ? queue.slice(index, index + MATCH_ROUND).map((q) => q.card) : []),
    [mode, queue, index],
  );

  const exit = () => {
    if (status === 'running' && index > 0) setConfirmExit(true);
    else router.push('/study');
  };

  // ── Render ──

  if (status === 'loading' || status === 'finishing') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Spinner className="size-7 text-primary" />
          <p className="text-sm">{status === 'loading' ? 'Kelimeler hazırlanıyor…' : 'Sonuçlar hesaplanıyor…'}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <EmptyState
          icon={AlertCircle}
          title="Oturum başlatılamadı"
          description={loadError}
          action={
            <>
              <Button onClick={restart}>Tekrar dene</Button>
              <ButtonLink href="/study" variant="secondary">
                Geri dön
              </ButtonLink>
            </>
          }
        />
      </div>
    );
  }

  if (status === 'empty') {
    const isList = source.startsWith('list:');
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <EmptyState
          icon={Inbox}
          title={mode === 'fill-blank' ? 'Örnek cümlesi olan kelime bulunamadı' : 'Çalışılacak kelime bulunamadı'}
          description={
            mode === 'fill-blank'
              ? 'Boşluk doldurma için kelimelerin örnek cümlesi olmalı. Başka bir mod dene ya da kelimelerine örnek cümle ekle.'
              : mode === 'matching'
                ? 'Eşleştirme için en az 4 kelime gerekiyor.'
                : source === 'weak'
                  ? 'Henüz zorlandığın bir kelime yok — harika!'
                  : isList
                    ? 'Bu listede henüz kelime yok. Önce birkaç kelime ekle.'
                    : 'Biraz sonra tekrar dene.'
          }
          action={
            <>
              {isList && <ButtonLink href={`/lists/${source.slice(5)}`}>Listeye git</ButtonLink>}
              <ButtonLink href="/study" variant={isList ? 'secondary' : 'primary'}>
                Başka bir mod seç
              </ButtonLink>
            </>
          }
        />
      </div>
    );
  }

  if (status === 'done' && summary) {
    return <SessionSummary data={summary} mode={mode} source={source} size={size} onRestart={restart} />;
  }

  const progress = queue.length ? Math.min(index, queue.length) / queue.length : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button variant="ghost" size="icon" onClick={exit} aria-label="Oturumdan çık">
            <X />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold text-fg">
                {info.name} <span className="font-normal text-muted">· {title}</span>
              </span>
              <span className="shrink-0 tabular text-muted">
                {Math.min(index + 1, queue.length)}/{queue.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <div className="relative flex items-center gap-1 rounded-full bg-xp-soft px-2.5 py-1 text-sm font-bold text-xp tabular">
            <Zap className="size-4 fill-current" aria-hidden />
            {xp}
            <span className="sr-only">XP</span>
            {xpBursts.map((b) => (
              <span key={b.id} className="pointer-events-none absolute -bottom-6 right-1 animate-float-up text-xs font-extrabold text-xp" aria-hidden>
                +{b.amount}
              </span>
            ))}
          </div>
        </div>
      </header>

      {mode === 'matching' ? (
        matchRound.length > 0 && (
          <MatchingMode
            key={`round-${index}`}
            cards={matchRound}
            onAnswer={(id, correct) => handleAnswer(id, correct)}
            onRoundDone={() => advance(matchRound.length)}
          />
        )
      ) : current ? (
        <ModeSwitch
          key={`${current.card.id}-${current.attempt}`}
          mode={mode}
          card={current.card}
          deck={deck}
          distractors={distractors}
          onAnswer={handleAnswer}
          onNext={() => advance(1)}
        />
      ) : null}

      <ConfirmDialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => router.push('/study')}
        title="Oturumdan çıkılsın mı?"
        description="Şu ana kadar verdiğin cevaplar kaydedildi. Kalan kelimeler bir sonraki çalışmanda karşına çıkar."
        confirmLabel="Çık"
        tone="primary"
      />
    </div>
  );
}

function ModeSwitch(props: {
  mode: StudyMode;
  card: StudyCard;
  deck: StudyCard[];
  distractors: Distractor[];
  onAnswer: (cardId: string, correct: boolean, rating?: Rating) => void;
  onNext: () => void;
}) {
  const { mode, ...rest } = props;
  switch (mode) {
    case 'flashcard':
      return <FlashcardMode {...rest} />;
    case 'multiple-choice':
      return <MultipleChoiceMode {...rest} />;
    case 'typing':
    case 'listening':
    case 'fill-blank':
      return <TypedMode {...rest} variant={mode} />;
    case 'speaking':
      return <SpeakingMode {...rest} />;
    default:
      return null;
  }
}
