'use client';

import { Award, Check, Clock, Flame, RotateCcw, Target, X, Zap } from 'lucide-react';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import { STUDY_MODE_INFO, type StudyMode } from '@/lib/study-modes';
import { Button, ButtonLink } from '@/components/ui/button';
import { ProgressBar, ProgressRing } from '@/components/ui/progress';
import { ListenButton } from './parts';
import type { StudyCard } from './types';
import type { SessionSummary as ServerSummary } from '@/server/study';

export interface SummaryData extends ServerSummary {
  cards: StudyCard[];
  firstTry: Map<string, boolean>;
}

function verdict(accuracy: number) {
  if (accuracy === 100) return { title: 'Kusursuz!', sub: 'Tek bir hata bile yok. Bu kelimeler artık senin.' };
  if (accuracy >= 80) return { title: 'Harika iş!', sub: 'Kelimelerin çoğu yerine oturdu. Kaçanlar yakında tekrar karşına çıkacak.' };
  if (accuracy >= 50) return { title: 'İyi gidiyorsun', sub: 'Zorlandığın kelimeleri sistem daha sık tekrar ettirecek.' };
  return { title: 'Başlamak işin yarısı', sub: 'Yeni kelimeler ilk seferde zor gelir — birkaç tekrar sonra çok daha kolay olacak.' };
}

export function SessionSummary({
  data,
  mode,
  onRestart,
}: {
  data: SummaryData;
  mode: StudyMode;
  source: string;
  size: number;
  onRestart: () => void;
}) {
  const answered = data.cards.filter((c) => data.firstTry.has(c.id));
  const firstCorrect = answered.filter((c) => data.firstTry.get(c.id)).length;
  const accuracy = answered.length ? Math.round((firstCorrect / answered.length) * 100) : 0;
  const v = verdict(accuracy);
  const goalReached = data.dailyGoal > 0 && data.todayWords >= data.dailyGoal;

  return (
    <div className="min-h-dvh pb-16">
      <div className="mx-auto max-w-2xl px-5 pt-10 sm:px-6 sm:pt-16">
        <div className="animate-pop text-center">
          <ProgressRing
            value={accuracy}
            max={100}
            size={132}
            stroke={12}
            tone={accuracy >= 80 ? 'success' : accuracy >= 50 ? 'primary' : 'xp'}
            className="mx-auto"
            label="İlk denemede doğruluk"
          >
            <div>
              <div className="font-display text-3xl font-extrabold tabular">%{accuracy}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted">doğruluk</div>
            </div>
          </ProgressRing>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">{v.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-muted">{v.sub}</p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: 'Kazanılan XP', value: `+${formatNumber(data.xpEarned)}`, tone: 'bg-xp-soft text-xp' },
            { icon: Target, label: 'Doğru', value: `${firstCorrect}/${answered.length}`, tone: 'bg-success-soft text-success' },
            { icon: Clock, label: 'Süre', value: data.durationMs ? formatDuration(data.durationMs) : '—', tone: 'bg-primary-soft text-primary-soft-fg' },
          ].map(({ icon: Icon, label, value, tone }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
              <span className={cn('mx-auto grid size-9 place-items-center rounded-xl', tone)}>
                <Icon className="size-[18px]" />
              </span>
              <div className="mt-2 font-display text-xl font-extrabold tabular">{value}</div>
              <div className="text-xs text-muted">{label}</div>
            </div>
          ))}
        </div>
        {data.bonusXp > 0 && (
          <p className="mt-3 text-center text-xs text-muted">
            Oturum bonusu dahil: <span className="font-semibold text-xp">+{data.bonusXp} XP</span>
          </p>
        )}

        {data.dailyGoal > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold">
                {goalReached ? <Check className="size-4 text-success" /> : <Target className="size-4 text-primary" />}
                Günlük hedef
              </span>
              <span className="tabular text-muted">
                {Math.min(data.todayWords, data.dailyGoal)}/{data.dailyGoal} kelime
              </span>
            </div>
            <ProgressBar value={data.todayWords} max={data.dailyGoal} tone={goalReached ? 'success' : 'primary'} className="mt-3" label="Günlük hedef" />
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
              <Flame className="size-4 text-streak" />
              {data.streak > 1 ? `${data.streak} günlük serin devam ediyor.` : 'Serin başladı — yarın da gel!'}
            </p>
          </div>
        )}

        {data.achievements.length > 0 && (
          <div className="mt-6 rounded-2xl border border-xp/30 bg-xp-soft p-5">
            <p className="flex items-center gap-2 font-display font-bold text-xp">
              <Award className="size-5" /> Yeni başarım{data.achievements.length > 1 ? 'lar' : ''}
            </p>
            <ul className="mt-2 space-y-1">
              {data.achievements.map((a) => (
                <li key={a.name} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-fg">{a.nameTr}</span>
                  <span className="font-semibold text-xp">+{a.xpReward} XP</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-3.5 text-sm font-semibold">Bu oturumdaki kelimeler</div>
          <ul className="divide-y divide-border">
            {answered.map((c) => {
              const ok = data.firstTry.get(c.id);
              return (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}>
                    {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-fg">{c.word}</p>
                    <p className="truncate text-sm text-muted">{c.turkishTranslation}</p>
                  </div>
                  <ListenButton text={c.word} className="size-8 [&_svg]:size-4" />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={onRestart}>
            <RotateCcw /> Bir tur daha ({STUDY_MODE_INFO[mode].name})
          </Button>
          <ButtonLink href="/study" size="lg" variant="secondary" className="flex-1">
            Başka mod
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg" variant="ghost" className="flex-1">
            Panele dön
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
