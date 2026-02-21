'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Navbar from '@/components/Navbar';

interface DetailedStats {
    overview: {
        totalLearned: number;
        masteredCount: number;
        learningCount: number;
        overallAccuracy: number;
        totalReviews: number;
    };
    monthlyTrend: {
        date: string;
        xp: number;
        words: number;
        sessions: number;
    }[];
    categoryStats: { name: string; value: number }[];
    typeStats: { name: string; value: number }[];
    weakWords: {
        id: string;
        word: string;
        translation: string;
        type: string;
        wrongCount: number;
        accuracy: number;
    }[];
}

const COLORS = ['#135bec', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function StatisticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        async function fetchDetailedStats() {
            try {
                const res = await fetch('/api/stats/detailed');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        if (status === 'authenticated') {
            fetchDetailedStats();
        }
    }, [status, router]);

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white">
            <Navbar />

            <main className="max-w-[1400px] mx-auto px-4 md:px-10 pt-32 pb-24">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Detaylı İstatistikler</h1>
                        <p className="text-[#92a4c9]">Öğrenme performansının kapsamlı analizi</p>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 relative z-10">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <p className="text-[#92a4c9] text-sm font-medium mb-1 relative z-10">Öğrenilen Kelime</p>
                        <p className="text-3xl font-bold text-white relative z-10">{stats.overview.totalLearned}</p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 relative z-10">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <p className="text-[#92a4c9] text-sm font-medium mb-1 relative z-10">Ustalaşılan</p>
                        <p className="text-3xl font-bold text-white relative z-10">{stats.overview.masteredCount}</p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 relative z-10">
                            <span className="material-symbols-outlined">psychology</span>
                        </div>
                        <p className="text-[#92a4c9] text-sm font-medium mb-1 relative z-10">Öğrenme Aşamasında</p>
                        <p className="text-3xl font-bold text-white relative z-10">{stats.overview.learningCount}</p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4 relative z-10">
                            <span className="material-symbols-outlined">track_changes</span>
                        </div>
                        <p className="text-[#92a4c9] text-sm font-medium mb-1 relative z-10">Genel Doğruluk</p>
                        <p className="text-3xl font-bold text-white relative z-10">%{stats.overview.overallAccuracy}</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Monthly Trend Area Chart */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white">30 Günlük Aktivite</h3>
                            <p className="text-sm text-[#92a4c9]">Günlük kazanılan deneyim puanı</p>
                        </div>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#135bec" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#92a4c9', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7a94', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a2235', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                        labelStyle={{ color: '#92a4c9', marginBottom: 4 }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            const d = payload[0]?.payload;
                                            return (
                                                <div className="bg-[#1a2235] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                                                    <p className="text-[#92a4c9] text-xs font-semibold mb-2">{label}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-white text-sm">🏆 <span className="font-bold">{d?.xp || 0}</span> XP</p>
                                                        <p className="text-white text-sm">📚 <span className="font-bold">{d?.words || 0}</span> Kelime</p>
                                                        <p className="text-white text-sm">🎯 <span className="font-bold">{d?.sessions || 0}</span> Oturum</p>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Area type="monotone" dataKey="xp" stroke="#135bec" fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution Pie Chart */}
                    <div className="glass-panel rounded-3xl p-6">
                        <div className="mb-2">
                            <h3 className="text-lg font-bold text-white">Kategori Dağılımı</h3>
                            <p className="text-sm text-[#92a4c9]">Öğrenilen kelimelerin kategorileri</p>
                        </div>
                        <div className="w-full h-[300px] flex items-center justify-center">
                            {stats.categoryStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.categoryStats}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {stats.categoryStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a2235', borderRadius: '12px', border: 'none' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-[#92a4c9]">Veri bulunamadı</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weak Words Table */}
                <div className="glass-panel rounded-3xl p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">En Çok Hata Yapılan Kelimeler</h3>
                            <p className="text-sm text-[#92a4c9]">Bu kelimeleri tekrar gözden geçirmen faydalı olabilir</p>
                        </div>
                        <Link href="/study/select" className="px-4 py-2 bg-[#135bec]/20 text-[#3b82f6] hover:bg-[#135bec]/30 rounded-xl transition-colors font-medium text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">school</span>
                            Test Çöz
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[#92a4c9] text-sm">
                                    <th className="pb-3 font-medium px-4">Kelime</th>
                                    <th className="pb-3 font-medium px-4">Çeviri</th>
                                    <th className="pb-3 font-medium px-4">Tür</th>
                                    <th className="pb-3 font-medium px-4 text-center">Hata Sayısı</th>
                                    <th className="pb-3 font-medium px-4 w-32">Doğruluk Oranı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.weakWords.length > 0 ? (
                                    stats.weakWords.map((word) => (
                                        <tr key={word.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-4 px-4 font-medium text-white">{word.word}</td>
                                            <td className="py-4 px-4 text-[#92a4c9]">{word.translation}</td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs bg-white/5 text-[#92a4c9] px-2 py-1 rounded">
                                                    {word.type === 'noun' ? 'İsim' : word.type === 'verb' ? 'Fiil' : word.type === 'adjective' ? 'Sıfat' : word.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-red-400 font-bold">{word.wrongCount}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 bg-[#1a2332] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${word.accuracy >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                            style={{ width: `${word.accuracy}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-[#92a4c9]">%{word.accuracy}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-[#92a4c9]">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
                                            </div>
                                            Harika gidiyorsun! Hata yaptığın kelime bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
