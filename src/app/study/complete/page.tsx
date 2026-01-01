'use client';

import Link from 'next/link';
import { useStudyStore } from '@/lib/store';
import { Trophy, RotateCcw, Home, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export default function StudyCompletePage() {
    const { stats, resetSession } = useStudyStore();
    const { update } = useSession();
    const xpProcessed = useRef(false);

    // Oturum tamamlanınca XP ver
    useEffect(() => {
        if (stats && !xpProcessed.current) {
            const xpEarned = (stats.goodCount * 5) + (stats.easyCount * 10);

            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: xpEarned,
                        source: 'flashcard'
                    })
                })
                    .then(res => {
                        if (res.ok) {
                            update(); // Session'ı güncelle (Navbar için)
                            window.dispatchEvent(new Event('xp-updated'));
                        }
                    })
                    .catch(err => console.error('XP Error:', err));
            }

            xpProcessed.current = true;
        }
    }, [stats, update]);

    // Calculate session duration
    const getDuration = () => {
        if (!stats?.startTime || !stats?.endTime) return '0 dk';
        const start = new Date(stats.startTime);
        const end = new Date(stats.endTime);

        const duration = Math.round(
            (end.getTime() - start.getTime()) / 60000
        );
        return duration < 1 ? '1 dk\'dan az' : `${duration} dk`;
    };

    const handleStartAgain = () => {
        resetSession();
    };

    if (!stats) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <p className="text-gray-600">Oturum verisi bulunamadı.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700"
                    >
                        <Home className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    const totalXpEarned = (stats.goodCount * 5) + (stats.easyCount * 10);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Celebration */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200 mb-6 transition-transform hover:scale-110">
                    <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Oturum Tamamlandı! 🎉
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                    Harika iş! Bu oturumdaki tüm kelimeleri gözden geçirdin.
                </p>
                <div className="inline-block px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-bold text-lg mt-2 shadow-sm border border-amber-100">
                    +{totalXpEarned} XP Kazandın! ⭐
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Oturum Özeti</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {/* Total Words */}
                    <div className="text-center p-4 bg-gray-50 rounded-2xl col-span-2 sm:col-span-1">
                        <p className="text-3xl font-bold text-gray-900">{stats.totalWords}</p>
                        <p className="text-sm text-gray-500 mt-1">Tekrar Edilen</p>
                    </div>

                    {/* Duration */}
                    <div className="text-center p-4 bg-gray-50 rounded-2xl font-mono">
                        <p className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-1">
                            {getDuration()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Süre</p>
                    </div>

                    {/* Hard Count */}
                    <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-3xl font-bold text-red-600">{stats.hardCount}</p>
                        <p className="text-sm text-red-600 mt-1">Zor Kelimeler</p>
                    </div>

                    {/* Good Count */}
                    <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-3xl font-bold text-amber-600">{stats.goodCount}</p>
                        <p className="text-sm text-amber-600 mt-1">İyi Kelimeler</p>
                    </div>

                    {/* Easy Count */}
                    <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-3xl font-bold text-emerald-600">{stats.easyCount}</p>
                        <p className="text-sm text-emerald-600 mt-1">Kolay Kelimeler</p>
                    </div>
                </div>

                {/* Performance Bar */}
                <div className="mt-8">
                    <p className="text-sm font-medium text-gray-700 mb-3">Performans Dağılımı</p>
                    <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
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
                                className="bg-emerald-500"
                                style={{ width: `${(stats.easyCount / stats.totalWords) * 100}%` }}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
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
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Ana Sayfa
                </Link>
                <Link
                    href="/study"
                    onClick={handleStartAgain}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <RotateCcw className="w-5 h-5" />
                    Tekrar Çalış
                </Link>
            </div>
        </div>
    );
}
