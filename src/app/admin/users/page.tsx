'use client';

import { useEffect, useState, useCallback } from 'react';

interface UserRow {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    subscriptionType: string;
    xp: number;
    level: number;
    streak: number;
    lastStudyDate: string | null;
    createdAt: string;
    aiUsageCount: number;
    onboardingComplete: boolean;
    _count: { wordLists: number; progress: number };
}

const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
    LITE: 'bg-[#135bec]/20 text-[#135bec] border-[#135bec]/20',
    PRO: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString() });
            if (search) params.set('q', search);
            if (planFilter !== 'all') params.set('plan', planFilter);
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, search, planFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const updateUser = async (userId: string, data: Record<string, string>) => {
        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...data }),
            });
            if (res.ok) fetchUsers();
        } catch (e) { console.error(e); }
        finally { setUpdating(null); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-400">group</span>
                    Kullanıcılar
                </h1>
                <p className="text-[#8b9bb4] mt-1">{total} kullanıcı</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8b9bb4] text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Ad veya email ara..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-12 pr-4 py-3 bg-[#111827]/60 rounded-xl border border-white/10 text-white placeholder:text-[#8b9bb4] focus:border-[#135bec]/50 focus:outline-none transition-colors text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'FREE', 'LITE', 'PRO'].map(p => (
                        <button
                            key={p}
                            onClick={() => { setPlanFilter(p); setPage(1); }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${planFilter === p ? 'bg-[#135bec] text-white' : 'bg-white/5 text-[#8b9bb4] border border-white/10 hover:bg-white/10'}`}
                        >
                            {p === 'all' ? 'Tümü' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111827]/60 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-[10px] uppercase tracking-widest text-[#8b9bb4]">
                                <th className="px-5 py-4 font-bold">Kullanıcı</th>
                                <th className="px-5 py-4 font-bold">Plan</th>
                                <th className="px-5 py-4 font-bold">XP</th>
                                <th className="px-5 py-4 font-bold">Listeler</th>
                                <th className="px-5 py-4 font-bold">Çalışma</th>
                                <th className="px-5 py-4 font-bold">AI</th>
                                <th className="px-5 py-4 font-bold">Kayıt</th>
                                <th className="px-5 py-4 font-bold">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-5 py-4"><div className="h-5 bg-white/5 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#8b9bb4]">Kullanıcı bulunamadı</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{user.name || '—'}</p>
                                                <p className="text-[#8b9bb4] text-xs truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${PLAN_COLORS[user.subscriptionType] || PLAN_COLORS.FREE}`}>
                                            {user.subscriptionType}
                                        </span>
                                        {user.role === 'ADMIN' && (
                                            <span className="ml-1.5 text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20">ADMIN</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-white text-sm font-medium">{user.xp.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-[#8b9bb4] text-sm">{user._count.wordLists}</td>
                                    <td className="px-5 py-4 text-[#8b9bb4] text-sm">{user._count.progress}</td>
                                    <td className="px-5 py-4 text-[#8b9bb4] text-sm">{user.aiUsageCount}</td>
                                    <td className="px-5 py-4 text-[#8b9bb4] text-xs">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={user.subscriptionType}
                                            onChange={e => updateUser(user.id, { subscriptionType: e.target.value })}
                                            disabled={updating === user.id}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#135bec]/50 disabled:opacity-50 cursor-pointer"
                                        >
                                            <option value="FREE">Free</option>
                                            <option value="LITE">Lite</option>
                                            <option value="PRO">Pro</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm disabled:opacity-30">← Önceki</button>
                    <span className="text-[#8b9bb4] text-sm">{page}/{totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm disabled:opacity-30">Sonraki →</button>
                </div>
            )}
        </div>
    );
}
