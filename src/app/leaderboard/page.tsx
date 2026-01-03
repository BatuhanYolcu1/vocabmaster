'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Crown, Flame, ArrowLeft, Calendar, CalendarDays, History } from 'lucide-react';

interface LeaderboardUser {
    rank: number;
    id: string;
    name: string;
    image?: string;
    xp: number;
    level: number;
    streak: number;
    isCurrentUser?: boolean;
}

type Period = 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, { label: string; icon: React.ReactNode }> = {
    week: { label: 'Bu Hafta', icon: <Calendar className="w-4 h-4" /> },
    month: { label: 'Bu Ay', icon: <CalendarDays className="w-4 h-4" /> },
    all: { label: 'Tüm Zamanlar', icon: <History className="w-4 h-4" /> },
};

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('all');

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const res = await fetch(`/api/leaderboard?period=${period}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [period]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-amber-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold">{rank}</span>;
        }
    };

    const getRankStyle = (rank: number, isCurrentUser?: boolean) => {
        if (isCurrentUser) {
            return 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-800';
        }
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600';
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700';
            default:
                return 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/"
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-7 h-7 text-amber-500" />
                        Liderlik Tablosu
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">En çok XP kazananlar</p>
                </div>
            </div>

            {/* Period Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${period === p
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {PERIOD_LABELS[p].icon}
                        <span className="hidden sm:inline">{PERIOD_LABELS[p].label}</span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                /* Leaderboard List */
                <div className="space-y-3">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getRankStyle(user.rank, user.isCurrentUser)}`}
                        >
                            {/* Rank */}
                            <div className="w-10 flex justify-center">
                                {getRankIcon(user.rank)}
                            </div>

                            {/* Avatar */}
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {user.name}
                                    {user.isCurrentUser && (
                                        <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                            Sen
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Seviye {user.level}</p>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">{user.xp.toLocaleString()} XP</p>
                                {user.streak > 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                                        <Flame className="w-3 h-3" />
                                        {user.streak} gün
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                            <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {period === 'week' && 'Bu hafta henüz aktivite yok'}
                                {period === 'month' && 'Bu ay henüz aktivite yok'}
                                {period === 'all' && 'Henüz kullanıcı yok'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
