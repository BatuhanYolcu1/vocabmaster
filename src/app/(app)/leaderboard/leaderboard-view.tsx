'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/server/leaderboard';
import { Card } from '@/components/ui/card';
import { Avatar, EmptyState, Segmented } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { cn, formatNumber } from '@/lib/utils';

interface Board {
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

const MEDALS = ['bg-xp text-white', 'bg-[#a8b3c4] text-white', 'bg-[#c98b52] text-white'];

function Row({ e, pinned }: { e: LeaderboardEntry; pinned?: boolean }) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-3 sm:px-5',
        e.isMe && 'bg-primary-soft',
        pinned && 'border-t-2 border-dashed border-border',
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular',
          e.rank <= 3 && !pinned ? MEDALS[e.rank - 1] : 'text-muted',
        )}
      >
        {e.rank}
      </span>
      <Avatar name={e.name} image={e.image} size={36} />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-semibold', e.isMe ? 'text-primary-soft-fg' : 'text-fg')}>
          {e.name} {e.isMe && <span className="text-xs font-medium">(sen)</span>}
        </p>
        <p className="text-xs text-muted">Seviye {e.level}</p>
      </div>
      <span className="shrink-0 font-display font-bold tabular text-fg">{formatNumber(e.xp)} XP</span>
    </li>
  );
}

export function LeaderboardView({ initial }: { initial: Board }) {
  const toast = useToast();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [boards, setBoards] = useState<Partial<Record<LeaderboardPeriod, Board>>>({ week: initial });
  const [loading, setLoading] = useState(false);
  const board = boards[period];

  async function change(p: LeaderboardPeriod) {
    setPeriod(p);
    if (boards[p]) return;
    setLoading(true);
    try {
      const data = await api<Board>(`/api/leaderboard?period=${p}`);
      setBoards((b) => ({ ...b, [p]: data }));
    } catch (error) {
      toast.error('Sıralama yüklenemedi', errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const meOutside = board?.me && !board.entries.some((e) => e.isMe) ? board.me : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Segmented
        label="Dönem"
        value={period}
        onChange={change}
        options={[
          { value: 'week', label: 'Bu hafta' },
          { value: 'month', label: 'Bu ay' },
          { value: 'all', label: 'Tüm zamanlar' },
        ]}
      />
      <Card className={cn('mt-4 overflow-hidden transition-opacity', loading && 'opacity-60')}>
        {!board || board.entries.length === 0 ? (
          <EmptyState icon={Trophy} title="Bu dönemde henüz kimse yok" description="Çalışmaya başla, listenin ilk sırasına sen yerleş!" />
        ) : (
          <ol className="divide-y divide-border">
            {board.entries.map((e) => (
              <Row key={e.id} e={e} />
            ))}
            {meOutside && <Row e={meOutside} pinned />}
          </ol>
        )}
      </Card>
      <p className="mt-3 text-center text-xs text-subtle">Gizliliğin için sıralamada yalnızca adın ve soyadının baş harfi görünür.</p>
    </div>
  );
}
