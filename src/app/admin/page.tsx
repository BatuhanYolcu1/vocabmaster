'use client';

import { useEffect, useState } from 'react';

interface Stats {
    users: { total: number; today: number; week: number; month: number; activeToday: number };
    plans: { FREE: number; LITE: number; PRO: number };
    words: { total: number; system: number };
    lists: number;
    studySessions: { total: number; today: number };
    revenue: { estimated: number };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded-xl w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-24 mb-3" />
                            <div className="h-8 bg-white/5 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return <p className="text-red-400">İstatistikler yüklenemedi.</p>;

    const statCards = [
        { label: 'Toplam Kullanıcı', value: stats.users.total, icon: 'group', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.3)' },
        { label: 'Bugün Aktif', value: stats.users.activeToday, icon: 'person_check', color: 'from-emerald-500 to-green-500', glow: 'rgba(16,185,129,0.3)' },
        { label: 'Bugün Kayıt', value: stats.users.today, icon: 'person_add', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.3)' },
        { label: 'Bu Hafta Kayıt', value: stats.users.week, icon: 'trending_up', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)' },
        { label: 'Toplam Kelime', value: stats.words.total, icon: 'dictionary', color: 'from-cyan-500 to-teal-500', glow: 'rgba(6,182,212,0.3)' },
        { label: 'Sistem Kelimeleri', value: stats.words.system, icon: 'library_books', color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.3)' },
        { label: 'Kelime Listeleri', value: stats.lists, icon: 'format_list_bulleted', color: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.3)' },
        { label: 'Bugün Çalışma', value: stats.studySessions.today, icon: 'school', color: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.3)' },
    ];

    const totalPaid = stats.plans.LITE + stats.plans.PRO;
    const totalUsers = stats.users.total || 1;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400">dashboard</span>
                    Dashboard
                </h1>
                <p className="text-[#8b9bb4] mt-1">Platform genel bakış</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div
                        key={card.label}
                        className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[#8b9bb4] text-xs font-medium uppercase tracking-wider">{card.label}</span>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:shadow-[0_0_20px_${card.glow}] transition-shadow`}>
                                <span className="material-symbols-outlined text-white text-lg">{card.icon}</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white">{card.value.toLocaleString('tr-TR')}</p>
                    </div>
                ))}
            </div>

            {/* Plan Distribution + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Distribution */}
                <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#135bec]">pie_chart</span>
                        Plan Dağılımı
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Free', count: stats.plans.FREE, color: 'bg-slate-500', pct: ((stats.plans.FREE / totalUsers) * 100).toFixed(0) },
                            { name: 'Lite', count: stats.plans.LITE, color: 'bg-[#135bec]', pct: ((stats.plans.LITE / totalUsers) * 100).toFixed(0) },
                            { name: 'Pro', count: stats.plans.PRO, color: 'bg-purple-500', pct: ((stats.plans.PRO / totalUsers) * 100).toFixed(0) },
                        ].map(p => (
                            <div key={p.name}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-white font-medium">{p.name}</span>
                                    <span className="text-[#8b9bb4]">{p.count} kullanıcı ({p.pct}%)</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${p.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(2, Number(p.pct))}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400">payments</span>
                        Gelir Tahmini
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-[#8b9bb4] text-xs uppercase tracking-wider mb-1">Tahmini Aylık Gelir</p>
                            <p className="text-4xl font-black text-emerald-400">₺{stats.revenue.estimated.toFixed(2)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-[#8b9bb4] text-xs mb-1">Ücretli Kullanıcı</p>
                                <p className="text-2xl font-bold text-white">{totalPaid}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-[#8b9bb4] text-xs mb-1">Dönüşüm Oranı</p>
                                <p className="text-2xl font-bold text-white">{totalUsers > 0 ? ((totalPaid / totalUsers) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-[#8b9bb4] text-xs mb-1">Toplam Çalışma Oturumu</p>
                            <p className="text-2xl font-bold text-white">{stats.studySessions.total.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
