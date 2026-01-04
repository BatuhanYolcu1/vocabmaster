'use client';

import Link from 'next/link';
import { useStudyStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export default function StudyCompletePage() {
    const { stats, resetSession } = useStudyStore();
    const { update } = useSession();
    const xpProcessed = useRef(false);

    useEffect(() => {
        if (stats && !xpProcessed.current) {
            const xpEarned = (stats.goodCount * 5) + (stats.easyCount * 10);

            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'flashcard' })
                })
                    .then(res => {
                        if (res.ok) {
                            update();
                            window.dispatchEvent(new Event('xp-updated'));
                        }
                    })
                    .catch(err => console.error('XP Error:', err));
            }

            xpProcessed.current = true;
        }
    }, [stats, update]);

    const getDuration = () => {
        if (!stats?.startTime || !stats?.endTime) return '0 dk';
        const start = new Date(stats.startTime);
        const end = new Date(stats.endTime);
        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
        return duration < 1 ? '1 dk\'dan az' : `${duration} dk`;
    };

    const handleStartAgain = () => {
        resetSession();
    };

    if (!stats) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="glass-panel rounded-3xl p-8 text-center">
                    <p className="text-[#92a4c9] mb-4">Oturum verisi bulunamadı.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#135bec] hover:text-blue-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    const totalXpEarned = (stats.goodCount * 5) + (stats.easyCount * 10);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Celebration */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.4)] mb-8">
                        <span className="material-symbols-outlined text-white text-5xl">emoji_events</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">
                        Oturum Tamamlandı! 🎉
                    </h1>
                    <p className="text-lg text-[#92a4c9] mb-4">
                        Harika iş! Bu oturumdaki tüm kelimeleri gözden geçirdin.
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-400 rounded-full font-bold text-lg border border-amber-500/30">
                        <span className="material-symbols-outlined">star</span>
                        +{totalXpEarned} XP Kazandın!
                    </div>
                </div>

                {/* Stats Card */}
                <div className="glass-panel rounded-3xl p-8 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-6">Oturum Özeti</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        {/* Total Words */}
                        <div className="glass-card rounded-2xl p-5 text-center col-span-2 sm:col-span-1">
                            <p className="text-3xl font-bold text-white">{stats.totalWords}</p>
                            <p className="text-sm text-[#92a4c9] mt-1">Tekrar Edilen</p>
                        </div>

                        {/* Duration */}
                        <div className="glass-card rounded-2xl p-5 text-center">
                            <p className="text-3xl font-bold text-white font-mono">{getDuration()}</p>
                            <p className="text-sm text-[#92a4c9] mt-1">Süre</p>
                        </div>

                        {/* Hard Count */}
                        <div className="rounded-2xl p-5 text-center bg-red-500/10 border border-red-500/20">
                            <p className="text-3xl font-bold text-red-400">{stats.hardCount}</p>
                            <p className="text-sm text-red-300 mt-1">Zor Kelimeler</p>
                        </div>

                        {/* Good Count */}
                        <div className="rounded-2xl p-5 text-center bg-amber-500/10 border border-amber-500/20">
                            <p className="text-3xl font-bold text-amber-400">{stats.goodCount}</p>
                            <p className="text-sm text-amber-300 mt-1">İyi Kelimeler</p>
                        </div>

                        {/* Easy Count */}
                        <div className="rounded-2xl p-5 text-center bg-green-500/10 border border-green-500/20">
                            <p className="text-3xl font-bold text-green-400">{stats.easyCount}</p>
                            <p className="text-sm text-green-300 mt-1">Kolay Kelimeler</p>
                        </div>
                    </div>

                    {/* Performance Bar */}
                    <div>
                        <p className="text-sm font-medium text-[#92a4c9] mb-3">Performans Dağılımı</p>
                        <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                            {stats.hardCount > 0 && (
                                <div
                                    className="bg-red-500"
                                    style={{ width: `${(stats.hardCount / stats.totalWords) * 100}%` }}
                                />
                            )}
                            {stats.goodCount > 0 && (
                                <div
                                    className="bg-amber-400"
                                    style={{ width: `${(stats.goodCount / stats.totalWords) * 100}%` }}
                                />
                            )}
                            {stats.easyCount > 0 && (
                                <div
                                    className="bg-green-500"
                                    style={{ width: `${(stats.easyCount / stats.totalWords) * 100}%` }}
                                />
                            )}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>Zor</span>
                            <span>İyi</span>
                            <span>Kolay</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        onClick={resetSession}
                        className="flex items-center gap-2 px-6 py-3 glass-button text-white rounded-xl font-medium"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfa
                    </Link>
                    <Link
                        href="/study/flashcard"
                        onClick={handleStartAgain}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Tekrar Çalış
                    </Link>
                </div>
            </div>
        </div>
    );
}
