'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Flame, BookOpen, CheckCircle2, Clock, Play, Plus, BarChart3, Trophy, ArrowRight
} from 'lucide-react';

function useAnimatedNumber(target: number, duration = 700) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    prevTarget.current = target;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);
  return current;
}

interface DashboardStats {
  wordsToReview: number;
  wordsLearned: number;
  todayWordsStudied: number;
  dailyGoal: number;
  streak: number;
  weeklyProgress: { name: string; xp: number; words: number; sessions: number }[];
  totalXp?: number;
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    wordsToReview: 0,
    wordsLearned: 0,
    todayWordsStudied: 0,
    dailyGoal: 20,
    streak: 0,
    weeklyProgress: [],
    totalXp: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then((data: DashboardStats | null) => { if (!data) return; setStats({
        wordsToReview: data.wordsToReview || 0,
        wordsLearned: data.wordsLearned || 0,
        todayWordsStudied: data.todayWordsStudied || 0,
        dailyGoal: data.dailyGoal || 20,
        streak: data.streak || 0,
        weeklyProgress: data.weeklyProgress || [],
        totalXp: data.totalXp || 0,
      }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Öğrenci';
  const dailyProgress = Math.min((stats.todayWordsStudied / stats.dailyGoal) * 100, 100);

  const animReview = useAnimatedNumber(stats.wordsToReview);
  const animLearned = useAnimatedNumber(stats.wordsLearned);
  const animToday = useAnimatedNumber(stats.todayWordsStudied);
  const animStreak = useAnimatedNumber(stats.streak);

  const statCards = [
    {
      label: 'Tekrar Bekliyor',
      value: animReview,
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      highlight: stats.wordsToReview > 0,
    },
    {
      label: 'Öğrenilen',
      value: animLearned,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      highlight: false,
    },
    {
      label: 'Bugün Çalışılan',
      value: animToday,
      icon: BookOpen,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      highlight: false,
    },
    {
      label: 'Günlük Seri',
      value: animStreak,
      suffix: ' gün',
      icon: Flame,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
      highlight: stats.streak > 0,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-56 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Merhaba, {firstName}
          </h1>
          <p className="text-[#6b7a94] text-sm">
            {stats.wordsToReview > 0
              ? `${stats.wordsToReview} kelime seni bekliyor`
              : 'Tüm tekrarlar tamam, yeni kelimeler öğren'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/study/select"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors"
          >
            <Play size={15} fill="currentColor" />
            Çalışmaya Başla
          </Link>
          <Link
            href="/wordlists/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/6 border border-white/8 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Plus size={15} />
            Liste Ekle
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl p-5 border transition-colors ${
                card.highlight
                  ? 'bg-[#111827] border-amber-500/20'
                  : 'bg-[#111827] border-white/6'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                <CardIcon size={18} className={card.iconColor} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">
                {card.value}{card.suffix ?? ''}
              </div>
              <div className="text-xs text-[#6b7a94]">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Daily progress */}
      <div className="bg-[#111827] border border-white/6 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Günlük Hedef</span>
          <span className="text-sm text-[#6b7a94]">
            {stats.todayWordsStudied} / {stats.dailyGoal} kelime
          </span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#135bec] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
        {dailyProgress >= 100 && (
          <p className="text-xs text-emerald-400 mt-2">Günlük hedefe ulaştın!</p>
        )}
      </div>

      {/* Weekly chart */}
      {stats.weeklyProgress.length > 0 && (
        <div className="bg-[#111827] border border-white/6 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Haftalık İlerleme</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyProgress} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#135bec" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e2e8f0' }}
                  labelStyle={{ color: '#6b7a94' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#135bec" strokeWidth={2} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/statistics', icon: BarChart3, label: 'İstatistikler', desc: 'Detaylı ilerleme raporu', color: 'text-blue-400' },
          { href: '/achievements', icon: Trophy, label: 'Başarılar', desc: 'Rozetler ve ödüller', color: 'text-amber-400' },
          { href: '/leaderboard', icon: Flame, label: 'Sıralama', desc: 'Diğerleriyle karşılaştır', color: 'text-orange-400' },
        ].map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#111827] border border-white/6 hover:border-white/12 hover:bg-[#111827]/80 transition-all group"
            >
              <ItemIcon size={18} className={item.color} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-[#6b7a94]">{item.desc}</div>
              </div>
              <ArrowRight size={14} className="text-[#6b7a94] group-hover:text-white transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

    </div>
  );
}
