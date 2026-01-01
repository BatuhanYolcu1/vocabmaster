'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Trophy, Lock, Star, ArrowLeft } from 'lucide-react';

interface Achievement {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    icon: string;
    xpReward: number;
    earned: boolean;
    earnedAt?: string;
}

export default function AchievementsPage() {
    const { data: session } = useSession();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ earned: 0, total: 0, totalXp: 0 });

    useEffect(() => {
        async function fetchAchievements() {
            try {
                const res = await fetch('/api/achievements');
                if (res.ok) {
                    const data = await res.json();
                    setAchievements(data.achievements);
                    setStats({
                        earned: data.earnedCount,
                        total: data.totalCount,
                        totalXp: data.totalXpEarned,
                    });
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchAchievements();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/profile"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-7 h-7 text-amber-500" />
                        Başarımlar
                    </h1>
                    <p className="text-gray-600">Rozetleri topla ve XP kazan!</p>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white mb-8 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-amber-100 text-sm mb-1">Kazanılan Başarımlar</p>
                        <p className="text-3xl font-bold">{stats.earned} / {stats.total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-amber-100 text-sm mb-1">Başarım XP</p>
                        <p className="text-3xl font-bold flex items-center gap-2">
                            <Star className="w-6 h-6" />
                            {stats.totalXp}
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${(stats.earned / stats.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`rounded-2xl p-5 text-center transition-all ${achievement.earned
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
                                : 'bg-gray-50 border-2 border-gray-100 opacity-60'
                            }`}
                    >
                        {/* Icon */}
                        <div className={`text-4xl mb-3 ${achievement.earned ? '' : 'grayscale'}`}>
                            {achievement.icon}
                        </div>

                        {/* Name */}
                        <h3 className={`font-semibold mb-1 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                            {achievement.nameTr}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-500 mb-3">
                            {achievement.descriptionTr}
                        </p>

                        {/* Status */}
                        {achievement.earned ? (
                            <div className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                                <Star className="w-3 h-3" />
                                +{achievement.xpReward} XP kazanıldı
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                Kilitli
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {achievements.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Başarım bulunamadı</p>
                </div>
            )}
        </div>
    );
}
