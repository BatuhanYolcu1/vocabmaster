'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Crown, Flame, ArrowLeft } from 'lucide-react';

interface LeaderboardUser {
    rank: number;
    id: string;
    name: string;
    image?: string;
    xp: number;
    level: number;
    streak: number;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch('/api/leaderboard');
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
    }, []);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-amber-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
            default:
                return 'bg-white border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-7 h-7 text-amber-500" />
                        Liderlik Tablosu
                    </h1>
                    <p className="text-gray-600">En çok XP kazananlar</p>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getRankStyle(user.rank)}`}
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
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {user.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">Seviye {user.level}</p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                            <p className="font-bold text-indigo-600">{user.xp.toLocaleString()} XP</p>
                            {user.streak > 0 && (
                                <p className="text-xs text-amber-600 flex items-center justify-end gap-1">
                                    <Flame className="w-3 h-3" />
                                    {user.streak} gün
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Henüz kullanıcı yok</p>
                    </div>
                )}
            </div>
        </div>
    );
}
