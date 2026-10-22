import type { Metadata } from 'next';
import {
  Award,
  BookOpen,
  CalendarCheck,
  Compass,
  Crown,
  Flame,
  Gem,
  Library,
  Lock,
  Moon,
  Sprout,
  Sunrise,
  Target,
  Timer,
  Zap,
} from 'lucide-react';
import { requireOnboardedUser } from '@/server/session';
import { achievementProgress } from '@/server/achievements';
import { PageHeader } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { cn, formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Başarımlar' };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sprout: Sprout,
  'book-open': BookOpen,
  library: Library,
  gem: Gem,
  flame: Flame,
  'calendar-check': CalendarCheck,
  target: Target,
  zap: Zap,
  moon: Moon,
  sunrise: Sunrise,
  compass: Compass,
  timer: Timer,
  crown: Crown,
};

export default async function AchievementsPage() {
  const user = await requireOnboardedUser();
  const items = await achievementProgress(user.id);
  const earned = items.filter((a) => a.earnedAt).length;
  const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const sorted = [...items].sort((a, b) => {
    if (!!a.earnedAt !== !!b.earnedAt) return a.earnedAt ? -1 : 1;
    return b.current / b.target - a.current / a.target;
  });

  return (
    <>
      <PageHeader
        title="Başarımlar"
        description={`${items.length} başarımdan ${earned} tanesini açtın. Her başarım ekstra XP kazandırır.`}
        actions={
          <div className="w-48">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>İlerleme</span>
              <span className="tabular">
                {earned}/{items.length}
              </span>
            </div>
            <ProgressBar value={earned} max={items.length} tone="xp" label="Başarım ilerlemesi" />
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          const done = !!a.earnedAt;
          return (
            <div
              key={a.name}
              className={cn(
                'flex gap-4 rounded-2xl border bg-surface p-4 shadow-sm',
                done ? 'border-xp/40' : 'border-border',
              )}
            >
              <span
                className={cn(
                  'relative grid size-14 shrink-0 place-items-center rounded-2xl',
                  done ? 'bg-xp-soft text-xp' : 'bg-surface-2 text-subtle',
                )}
              >
                <Icon className="size-7" />
                {!done && (
                  <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-surface bg-surface-3 text-muted">
                    <Lock className="size-2.5" />
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('font-semibold', done ? 'text-fg' : 'text-muted')}>{a.title}</p>
                  <span className={cn('shrink-0 text-xs font-bold', done ? 'text-xp' : 'text-subtle')}>+{a.xpReward} XP</span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{a.description}</p>
                {done ? (
                  <p className="mt-2 text-xs text-subtle">{dateFmt.format(a.earnedAt!)} tarihinde kazanıldı</p>
                ) : a.measurable ? (
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-end text-[11px] tabular text-muted">
                      {formatNumber(a.current)}/{formatNumber(a.target)}
                    </div>
                    <ProgressBar value={a.current} max={a.target} className="h-1.5" label={`${a.title} ilerleme`} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
