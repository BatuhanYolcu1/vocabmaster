'use client';

import Link from 'next/link';
import { useStudyStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trophy, Home, RefreshCw, Star } from 'lucide-react';

interface SessionStats {
  totalWords: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  startTime: string;
  endTime: string;
}

function StudyCompleteContent() {
  const searchParams = useSearchParams();
  const { resetSession } = useStudyStore();
  const { update } = useSession();

  const sessionStats: SessionStats | null = (() => {
    const total = searchParams.get('total');
    const hard = searchParams.get('hard');
    const good = searchParams.get('good');
    const easy = searchParams.get('easy');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (total && hard && good && easy && start && end) {
      return { totalWords: parseInt(total), hardCount: parseInt(hard), goodCount: parseInt(good), easyCount: parseInt(easy), startTime: start, endTime: end };
    }
    return null;
  })();

  useEffect(() => {
    if (sessionStats) { update(); window.dispatchEvent(new Event('xp-updated')); }
  }, [sessionStats, update]);

  const getDuration = () => {
    if (!sessionStats?.startTime || !sessionStats?.endTime) return '0 dk';
    const diff = Math.round((new Date(sessionStats.endTime).getTime() - new Date(sessionStats.startTime).getTime()) / 60000);
    return diff < 1 ? '< 1 dk' : `${diff} dk`;
  };

  if (!sessionStats) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#6b7a94] mb-4">Oturum verisi bulunamadı.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-[#135bec] hover:text-blue-400 transition-colors text-sm">
            <Home size={15} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const totalXpEarned = sessionStats.goodCount * 5 + sessionStats.easyCount * 10;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-5">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Oturum Tamamlandı!</h1>
          <p className="text-[#6b7a94] text-sm mb-4">Tüm kelimeleri gözden geçirdin.</p>
          {totalXpEarned > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm font-semibold">
              <Star size={15} fill="currentColor" />
              +{totalXpEarned} XP
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-[#111827] border border-white/6 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-[#6b7a94] mb-5">Özet</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="text-center p-4 bg-white/4 rounded-lg">
              <div className="text-2xl font-bold text-white">{sessionStats.totalWords}</div>
              <div className="text-xs text-[#6b7a94] mt-0.5">Tekrar Edilen</div>
            </div>
            <div className="text-center p-4 bg-white/4 rounded-lg">
              <div className="text-2xl font-bold text-white">{getDuration()}</div>
              <div className="text-xs text-[#6b7a94] mt-0.5">Süre</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 bg-red-500/8 border border-red-500/15 rounded-lg">
              <div className="text-xl font-bold text-red-400">{sessionStats.hardCount}</div>
              <div className="text-xs text-red-400/70 mt-0.5">Zor</div>
            </div>
            <div className="text-center p-3 bg-amber-500/8 border border-amber-500/15 rounded-lg">
              <div className="text-xl font-bold text-amber-400">{sessionStats.goodCount}</div>
              <div className="text-xs text-amber-400/70 mt-0.5">İyi</div>
            </div>
            <div className="text-center p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
              <div className="text-xl font-bold text-emerald-400">{sessionStats.easyCount}</div>
              <div className="text-xs text-emerald-400/70 mt-0.5">Kolay</div>
            </div>
          </div>

          {/* Performance bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-white/6">
            {sessionStats.hardCount > 0 && (
              <div className="bg-red-500" style={{ width: `${(sessionStats.hardCount / sessionStats.totalWords) * 100}%` }} />
            )}
            {sessionStats.goodCount > 0 && (
              <div className="bg-amber-400" style={{ width: `${(sessionStats.goodCount / sessionStats.totalWords) * 100}%` }} />
            )}
            {sessionStats.easyCount > 0 && (
              <div className="bg-emerald-500" style={{ width: `${(sessionStats.easyCount / sessionStats.totalWords) * 100}%` }} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            onClick={resetSession}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/6 border border-white/8 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Home size={15} />
            Ana Sayfa
          </Link>
          <Link
            href="/study/select"
            onClick={() => resetSession()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors"
          >
            <RefreshCw size={15} />
            Tekrar Çalış
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function StudyCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin" />
      </div>
    }>
      <StudyCompleteContent />
    </Suspense>
  );
}
