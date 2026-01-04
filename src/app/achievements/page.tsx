'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    glowColor: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}

const achievements: Achievement[] = [
    { id: '1', title: 'Ateşli Seri', description: '7 gün boyunca aralıksız pratik yaptın.', icon: 'local_fire_department', gradient: 'from-orange-400 to-red-600', glowColor: 'orange-500', unlocked: true, unlockedAt: '12 Ekim 2023' },
    { id: '2', title: 'Kelime Avcısı', description: 'İlk 100 kelimeyi başarıyla öğrendin.', icon: 'menu_book', gradient: 'from-blue-400 to-[#135bec]', glowColor: 'blue-500', unlocked: true, unlockedAt: '05 Ekim 2023' },
    { id: '3', title: 'İyi Dinleyici', description: 'Toplam 2 saat boyunca dinleme pratiği tamamladın.', icon: 'headphones', gradient: 'from-purple-400 to-fuchsia-600', glowColor: 'purple-500', unlocked: true, unlockedAt: '20 Eylül 2023' },
    { id: '4', title: 'Efsanevi Üye', description: 'Seviye 10\'a ulaşarak elit üyeler arasına katıl.', icon: 'workspace_premium', gradient: 'from-yellow-300 to-amber-500', glowColor: 'yellow-500', unlocked: false, progress: 5, maxProgress: 10 },
    { id: '5', title: 'Hızlı Öğrenci', description: '1 günde 50 kelime öğren.', icon: 'bolt', gradient: 'from-cyan-400 to-teal-600', glowColor: 'cyan-500', unlocked: false, progress: 23, maxProgress: 50 },
    { id: '6', title: 'Sosyal Kelebek', description: '10 arkadaşını davet et.', icon: 'people', gradient: 'from-pink-400 to-rose-600', glowColor: 'pink-500', unlocked: false, progress: 2, maxProgress: 10 },
    { id: '7', title: 'Mükemmeliyetçi', description: 'Bir quizde %100 doğruluk oranı yakala.', icon: 'verified', gradient: 'from-emerald-400 to-green-600', glowColor: 'emerald-500', unlocked: true, unlockedAt: '18 Ekim 2023' },
    { id: '8', title: 'Maratoncu', description: '30 gün boyunca aralıksız pratik yap.', icon: 'directions_run', gradient: 'from-indigo-400 to-violet-600', glowColor: 'indigo-500', unlocked: false, progress: 12, maxProgress: 30 },
];

export default function AchievementsPage() {
    const { data: session } = useSession();
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    const filteredAchievements = achievements.filter(a => {
        if (filter === 'unlocked') return a.unlocked;
        if (filter === 'locked') return !a.unlocked;
        return true;
    });

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

    return (
        <div className="min-h-screen bg-[#101622] text-white font-['Lexend'] relative overflow-x-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#135bec]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-10 py-8 flex flex-col gap-8">
                {/* Hero Section: Title + Stats */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Headings & Progress */}
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">Başarımlar</h1>
                            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                                Kelime hazineni genişlet, rozetleri topla! Şu ana kadar harika gidiyorsun, hedeflerine ulaşmak için devam et.
                            </p>
                        </div>
                        <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 max-w-xl">
                            <div className="flex justify-between items-end">
                                <p className="text-white font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#135bec] text-xl">trophy</span>
                                    Genel İlerleme
                                </p>
                                <p className="text-[#135bec] font-bold">%{progressPercent}</p>
                            </div>
                            <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-[#135bec] rounded-full shadow-[0_0_10px_rgba(19,91,236,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400">Sonraki seviye için {achievements.length - unlockedCount} başarım daha kazan.</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex flex-wrap gap-4 lg:min-w-[400px]">
                        <div className="glass-card flex-1 min-w-[140px] rounded-xl p-5 flex flex-col justify-between h-32">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-2">
                                <span className="material-symbols-outlined">military_tech</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Toplam Rozet</p>
                                <p className="text-white text-3xl font-bold">{achievements.length}</p>
                            </div>
                        </div>
                        <div className="glass-card flex-1 min-w-[140px] rounded-xl p-5 flex flex-col justify-between h-32">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-2">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Kazanılan</p>
                                <p className="text-white text-3xl font-bold">{unlockedCount}</p>
                            </div>
                        </div>
                        <div className="glass-card flex-1 min-w-[140px] rounded-xl p-5 flex flex-col justify-between h-32">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Seviye</p>
                                <p className="text-white text-3xl font-bold">5</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 transition-transform active:scale-95 ${filter === 'all'
                                ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/25'
                                : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white'
                            }`}
                    >
                        <span className="text-sm font-medium">Tümü</span>
                    </button>
                    <button
                        onClick={() => setFilter('unlocked')}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 transition-all active:scale-95 ${filter === 'unlocked'
                                ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/25'
                                : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white'
                            }`}
                    >
                        <span className="text-sm font-medium">Kazanılan</span>
                    </button>
                    <button
                        onClick={() => setFilter('locked')}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 transition-all active:scale-95 ${filter === 'locked'
                                ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/25'
                                : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white'
                            }`}
                    >
                        <span className="text-sm font-medium">Kilitli</span>
                    </button>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {filteredAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`glass-card relative group rounded-xl p-6 flex flex-col gap-4 overflow-hidden ${!achievement.unlocked ? 'grayscale opacity-70 hover:opacity-100' : ''
                                }`}
                        >
                            {/* Locked Overlay */}
                            {!achievement.unlocked && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10 group-hover:bg-black/20 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 shadow-xl">
                                        <span className="material-symbols-outlined text-2xl">lock</span>
                                    </div>
                                </div>
                            )}

                            {/* Completed Badge */}
                            {achievement.unlocked && (
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">TAMAMLANDI</span>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.gradient} flex items-center justify-center shadow-lg shadow-${achievement.glowColor}/20 mb-2 group-hover:scale-110 transition-transform duration-300`}>
                                <span className="material-symbols-outlined text-white text-4xl">{achievement.icon}</span>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="text-white text-lg font-bold mb-1">{achievement.title}</h3>
                                <p className="text-slate-400 text-sm leading-snug">{achievement.description}</p>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-4 border-t border-white/5">
                                {achievement.unlocked ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="material-symbols-outlined text-base">calendar_today</span>
                                        <span>{achievement.unlockedAt}&apos;te kazanıldı</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>İlerleme</span>
                                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-700 rounded-full">
                                            <div
                                                className="h-full bg-slate-400 rounded-full"
                                                style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
