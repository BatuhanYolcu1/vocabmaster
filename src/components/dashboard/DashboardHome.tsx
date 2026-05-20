'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Animated number hook for counting effect
function useAnimatedNumber(target: number, duration = 800) {
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
        totalXp: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        wordsToReview: data.wordsToReview || 0,
                        wordsLearned: data.wordsLearned || 0,
                        todayWordsStudied: data.todayWordsStudied || 0,
                        dailyGoal: data.dailyGoal || 20,
                        streak: data.streak || 0,
                        weeklyProgress: data.weeklyProgress || [],
                        totalXp: data.totalXp || 0
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

    const firstName = session?.user?.name?.split(' ')[0] || 'Öğrenci';
    const dailyProgress = Math.min((stats.todayWordsStudied / stats.dailyGoal) * 100, 100);

    // Animated numbers
    const animReview = useAnimatedNumber(stats.wordsToReview);
    const animLearned = useAnimatedNumber(stats.wordsLearned);
    const animToday = useAnimatedNumber(stats.todayWordsStudied);
    const animStreak = useAnimatedNumber(stats.streak);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 relative">
                <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/30 blur-[100px] pointer-events-none" />
                <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-24 bg-white border border-slate-200/50 rounded-3xl" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-white border border-slate-200/50 rounded-3xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-[#0f172a] relative overflow-x-hidden">
            {/* Ambient Background Lighting */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-[140px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/20 blur-[120px] pointer-events-none z-0" />
            <div className="fixed top-[40%] left-[30%] w-[20%] h-[20%] rounded-full bg-cyan-100/20 blur-[90px] pointer-events-none z-0" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-10 py-8 space-y-8">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0f172a] mb-1">
                            Merhaba, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] to-purple-600">{firstName}!</span>
                        </h1>
                        <p className="text-[#64748b] text-lg font-medium">
                            Bugün öğrenmek için harika bir gün. Hedefine çok yakınsın!
                        </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Link
                            href="/study/select"
                            className="h-12 px-6 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-sm hover:shadow-[0_10px_20px_-5px_rgba(19,91,236,0.3)] hover:scale-102 transition-all duration-300 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                        >
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                            Hemen Başla
                        </Link>
                        <Link
                            href="/wordlists/new"
                            className="h-12 px-6 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            Kelime Ekle
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: To Review */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-default relative overflow-hidden shadow-sm">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            </div>
                            {stats.wordsToReview > 0 && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">Önemli</span>
                            )}
                        </div>
                        <div className="relative z-10">
                            <p className="text-[#64748b] text-xs font-bold uppercase tracking-wider mb-1">Tekrar Edilecek</p>
                            <p className="text-3xl font-extrabold text-[#0f172a]">{animReview}</p>
                        </div>
                    </div>

                    {/* Stat 2: Learned */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-default relative overflow-hidden shadow-sm">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[#64748b] text-xs font-bold uppercase tracking-wider mb-1">Öğrenilen Kelime</p>
                            <p className="text-3xl font-extrabold text-[#0f172a]">{animLearned}</p>
                        </div>
                    </div>

                    {/* Stat 3: Daily Goal */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-default relative overflow-hidden shadow-sm">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#135bec]">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                            </div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#135bec] border border-blue-100">
                                {Math.round(dailyProgress)}%
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[#64748b] text-xs font-bold uppercase tracking-wider mb-1">Günlük Hedef</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-extrabold text-[#0f172a]">{animToday}</p>
                                <p className="text-lg font-bold text-[#64748b]">/{stats.dailyGoal}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stat 4: Streak */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-default relative overflow-hidden shadow-sm">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[#64748b] text-xs font-bold uppercase tracking-wider mb-1">Gün Serisi</p>
                            <p className="text-3xl font-extrabold text-[#0f172a]">{animStreak} Gün</p>
                        </div>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column Stack */}
                    <div className="lg:col-span-2 flex flex-col gap-6 w-full">
                        {/* Main Chart Section */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 flex flex-col w-full h-[320px] shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0f172a]">Haftalık Aktivite</h3>
                                    <p className="text-xs text-[#64748b] font-medium">Son 7 günlük performansın</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full" style={{ minHeight: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.weeklyProgress.length > 0
                                            ? stats.weeklyProgress
                                            : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => ({ name: d, xp: 0 }))
                                        }
                                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#135bec" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid rgba(226,232,240,0.8)',
                                                borderRadius: '16px',
                                                color: '#0f172a',
                                                fontSize: '12px',
                                                boxShadow: '0 10px 25px -5px rgba(15,23,42,0.08)',
                                                padding: '10px 14px',
                                            }}
                                            labelStyle={{ color: '#64748b', marginBottom: 4, fontWeight: 700 }}
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload?.length) return null;
                                                const d = payload[0]?.payload;
                                                return (
                                                    <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-lg">
                                                        <p className="text-slate-500 text-xs font-bold mb-2">{label}</p>
                                                        <div className="space-y-1 text-slate-700">
                                                            <p className="text-sm font-semibold flex items-center gap-1">🏆 <span className="font-extrabold text-[#135bec]">{d?.xp || 0}</span> XP</p>
                                                            <p className="text-xs flex items-center gap-1">📚 <span className="font-bold">{d?.words || 0}</span> Kelime</p>
                                                            <p className="text-xs flex items-center gap-1">🎯 <span className="font-bold">{d?.sessions || 0}</span> Oturum</p>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="xp"
                                            stroke="#135bec"
                                            strokeWidth={2.5}
                                            fill="url(#xpGradient)"
                                            dot={{ r: 4, fill: '#135bec', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Motivation Quote */}
                        {(() => {
                            const quotes = [
                                "Her gün bir kelime öğrenmek, bir yılda 365 yeni kelime demek. Küçük adımlar büyük başarılar getirir.",
                                "Dil öğrenmenin en iyi zamanı dün idi, ikinci en iyi zaman şimdi.",
                                "Bilgi güçtür, her yeni kelime sana yeni bir kapı açar.",
                                "Düzenli çalışma, yetenekten daha önemlidir.",
                                "Her usta bir zamanlar çıraktı. Öğrenmeye devam et!",
                                "Bir dili konuşmak, o kültürün ruhunu anlamaktır.",
                                "Bugün öğrendiğin kelime, yarın kuracağın cümlenin temelidir.",
                                "Hata yapmak öğrenmenin en doğal parçasıdır. Cesur ol!",
                                "Öğrenmek bir maraton, sprint değil. Sabırlı ol.",
                                "Her gün biraz daha ilerlemek, ayda dağları aşmak demektir.",
                                "Kelimeler dünyaya açılan pencerelerdir.",
                                "Öğrenme yolculuğunda en önemli adım, bir sonraki adımdır.",
                                "Zekâ, bildiklerinle değil; öğrenme isteğinle ölçülür.",
                                "Bugünün çabası, yarının özgüvenidir.",
                                "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."
                            ];
                            const quote = quotes[Math.floor(Math.random() * quotes.length)];
                            return (
                                <div className="bg-white/85 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 relative overflow-hidden shadow-sm mt-6 lg:mt-0">
                                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-purple-100/50 rounded-full blur-xl" />
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-purple-600">format_quote</span>
                                        <h3 className="text-sm font-bold text-[#0f172a]">Günün Motivasyon Sözü</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                        &quot;{quote}&quot;
                                    </p>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Right Column Stack */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Goal Progress Detail */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-[#0f172a]">Günlük İlerleme</h3>
                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#135bec] bg-blue-50 px-2.5 py-1 rounded-full">
                                    {stats.dailyGoal - stats.todayWordsStudied > 0 ? `${stats.dailyGoal - stats.todayWordsStudied} kelime kaldı` : '✨ Tamamlandı!'}
                                </span>
                            </div>
                            <div className="relative h-4 w-full bg-slate-100 border border-slate-200/40 rounded-full overflow-hidden mb-2 shadow-inner">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-[#135bec] rounded-full shadow-[0_4px_12px_rgba(19,91,236,0.15)]"
                                    style={{ width: `${dailyProgress}%` }}
                                >
                                    <div className="absolute top-0 right-0 h-full w-[20px] bg-white/20 blur-[4px]" />
                                </div>
                            </div>
                            <p className="text-xs text-[#64748b] font-medium">İstikrarını koruyorsun! Böyle devam et.</p>
                        </div>

                        {/* Daily Quests (Oyunlaştırma) */}
                        {(() => {
                            const actualTodayProgress = stats.weeklyProgress[stats.weeklyProgress.length - 1] || { xp: 0, words: 0, sessions: 0 };

                            const quests = [
                                { id: 1, title: '10 Kelime Çalış', target: 10, current: stats.todayWordsStudied, xpReward: 10, icon: 'menu_book', color: 'blue' },
                                { id: 2, title: '50 XP Kazan', target: 50, current: actualTodayProgress.xp, xpReward: 20, icon: 'local_fire_department', color: 'orange' },
                                { id: 3, title: '2 Oturum Tamamla', target: 2, current: actualTodayProgress.sessions || 0, xpReward: 15, icon: 'task_alt', color: 'emerald' },
                            ];

                            return (
                                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-yellow-500">workspace_premium</span>
                                                Günlük Görevler
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="space-y-3.5">
                                        {quests.map(quest => {
                                            const progressPercentage = Math.min(100, (quest.current / quest.target) * 100);
                                            const isCompleted = quest.current >= quest.target;

                                            let iconBgClass = 'bg-slate-100';
                                            let iconTextClass = 'text-slate-600';

                                            if (isCompleted) {
                                                iconBgClass = 'bg-emerald-50';
                                                iconTextClass = 'text-emerald-500';
                                            } else if (quest.color === 'blue') {
                                                iconBgClass = 'bg-blue-50';
                                                iconTextClass = 'text-[#135bec]';
                                            } else if (quest.color === 'orange') {
                                                iconBgClass = 'bg-orange-50';
                                                iconTextClass = 'text-orange-500';
                                            } else if (quest.color === 'emerald') {
                                                iconBgClass = 'bg-emerald-50';
                                                iconTextClass = 'text-emerald-500';
                                            }

                                            return (
                                                <div key={quest.id} className={`p-3 rounded-2xl border ${isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/60 border-slate-100'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass} ${iconTextClass}`}>
                                                                <span className="material-symbols-outlined text-sm">{isCompleted ? 'check' : quest.icon}</span>
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>{quest.title}</p>
                                                                <p className="text-[10px] text-slate-400 font-semibold">{quest.current} / {quest.target}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                                            <span className="material-symbols-outlined text-[10px] text-yellow-600">stars</span>
                                                            <span className="text-[10px] font-extrabold text-yellow-600">+{quest.xpReward}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                                            style={{ width: `${progressPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Practice CTA Banner - Full Width - Premium Design */}
                <Link
                    href="/study/select"
                    className="block relative overflow-hidden group rounded-[2rem] transition-all duration-700 shadow-lg hover:shadow-xl"
                >
                    {/* Layered Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Animated Grid Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }} />

                    {/* Floating Particles */}
                    <div className="absolute top-6 left-[20%] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute bottom-8 left-[40%] w-1 h-1 bg-violet-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    <div className="absolute top-10 right-[30%] w-1 h-1 bg-rose-400 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />

                    {/* Glowing Orb */}
                    <div className="absolute -right-20 -top-20 w-72 h-72 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl group-hover:from-cyan-500/40 group-hover:to-violet-500/40 transition-all duration-700" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left Side */}
                        <div className="flex items-center gap-6">
                            {/* Orbital Icon System */}
                            <div className="relative w-24 h-24 flex-shrink-0">
                                {/* Outer Ring */}
                                <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />

                                {/* Middle Ring */}
                                <div className="absolute inset-2 border border-cyan-500/30 rounded-full" />

                                {/* Core */}
                                <div className="absolute inset-4 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-all duration-500">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
                                        <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
                                    </svg>
                                </div>

                                {/* Orbiting Elements */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg text-[10px] text-white animate-bounce" style={{ animationDuration: '2s' }}>
                                    ⚡
                                </div>
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg text-[10px] text-white animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                                    ◈
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center shadow-lg text-[10px] text-white animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                                    ✦
                                </div>
                            </div>

                            {/* Text Content */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                                        ◇ Bugün Hazır mısın?
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:via-white group-hover:to-violet-300 transition-all duration-500">
                                    Öğrenme Arenası
                                </h3>
                                <p className="text-sm text-[#94a3b8] max-w-sm">
                                    Beyin Kartları, Bilgi Yarışması, Parmak Hafızası ve daha fazlası seni bekliyor
                                </p>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-5">
                            {/* Mode Pills */}
                            <div className="hidden lg:flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                    <span className="text-xs font-medium text-white/70">6 Mod</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-xs font-medium text-white/70">Akıllı SRS</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    <span className="text-xs font-medium text-white/70">XP Kazan</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-14 h-14 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform">
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Gradient Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>
        </div >
    );
}
