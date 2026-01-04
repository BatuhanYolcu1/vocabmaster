'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Play,
    Target,
    ArrowRight,
    BookOpen,
    Flame,
    Clock,
    Trophy,
    Zap,
    Star,
    TrendingUp,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardStats {
    wordsToReview: number;
    wordsLearned: number;
    dailyGoal: number;
    streak: number;
    weeklyProgress: { name: string; xp: number }[];
}

export default function DashboardHome() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        wordsToReview: 0,
        wordsLearned: 0,
        dailyGoal: 20,
        streak: 0,
        weeklyProgress: []
    });
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('Merhaba');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Günaydın');
        else if (hour < 18) setGreeting('İyi Günler');
        else setGreeting('İyi Akşamlar');

        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        wordsToReview: data.wordsToReview || 0,
                        wordsLearned: data.wordsLearned || 0,
                        dailyGoal: data.dailyGoal || 20,
                        streak: data.streak || 0,
                        weeklyProgress: data.weeklyProgress || []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const dailyProgress = Math.min((stats.wordsLearned / stats.dailyGoal) * 100, 100);
    const firstName = session?.user?.name?.split(' ')[0] || 'Öğrenci';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-32 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/25">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />

                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <span className="text-indigo-200 text-sm font-medium">VocabMaster Premium</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold">
                                {greeting}, <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">{firstName}</span>! ✨
                            </h1>
                            <p className="text-indigo-100 text-lg max-w-xl">
                                Bugün harika işler başarabilirsin. Hedefine ulaşmak için sadece birkaç kelime kaldı!
                            </p>
                        </div>

                        <Link
                            href="/study/modes"
                            className="group flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            <span>Çalışmaya Başla</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mt-8 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-indigo-200">Günlük Hedef</span>
                            <span className="font-bold">{stats.wordsLearned} / {stats.dailyGoal} kelime</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${dailyProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </div>
                        </div>
                        {dailyProgress >= 100 && (
                            <div className="flex items-center gap-2 mt-3 text-yellow-300">
                                <Trophy className="w-5 h-5" />
                                <span className="font-medium">Günlük hedefini tamamladın! 🎉</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-600 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.wordsToReview}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tekrar Edilecek</p>
                    </div>

                    <div className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-600 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <Star className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.wordsLearned}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Öğrenilen</p>
                    </div>

                    <div className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <Zap className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.dailyGoal}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Günlük Hedef</p>
                    </div>

                    <div className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-600 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                            {stats.streak > 0 && (
                                <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                    🔥 Aktif
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gün Serisi</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Haftalık İlerleme</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Son 7 günlük performansın</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium">XP Kazanımı</span>
                            </div>
                        </div>

                        {stats.weeklyProgress.some(d => d.xp > 0) ? (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.weeklyProgress}>
                                        <defs>
                                            <linearGradient id="colorXpNew" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            width={40}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                                padding: '12px 16px'
                                            }}
                                            formatter={(value) => [`${value} XP`, 'Kazanılan']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="xp"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorXpNew)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[280px] flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
                                    <TrendingUp className="w-10 h-10 text-indigo-400" />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Henüz bu hafta çalışma yapmadın</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Quiz bitirdikçe grafiğin burada oluşacak!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Hızlı Erişim</h3>

                            <Link href="/categories" className="group block bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <BookOpen className="w-8 h-8 mb-3 opacity-90" />
                                        <h4 className="text-lg font-bold">Kelimelerim</h4>
                                        <p className="text-emerald-100 text-sm mt-1">Listelerini yönet</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/achievements" className="group block bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transform hover:scale-[1.02] transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Trophy className="w-8 h-8 mb-3 opacity-90" />
                                        <h4 className="text-lg font-bold">Başarımlar</h4>
                                        <p className="text-amber-100 text-sm mt-1">Rozetlerini keşfet</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        </div>

                        {/* Daily Tip */}
                        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-400/20 rounded-full blur-xl" />

                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">💡</span>
                                    <h4 className="font-bold">Günün İpucu</h4>
                                </div>
                                <p className="text-violet-100 text-sm leading-relaxed">
                                    Beynimiz uyurken öğrendiklerimizi işler. Uyumadan önce 10 dakika kelime tekrarı yapmak, kalıcılığı %40 artırır!
                                </p>
                            </div>
                        </div>

                        {/* Leaderboard Preview */}
                        <Link
                            href="/leaderboard"
                            className="group block bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all hover:shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Liderlik Tablosu</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Sıralamanda yüksel!</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
