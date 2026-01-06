'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface LeaderboardUser {
    id: string;
    name: string;
    image: string | null;
    xp: number;
    rank: number;
}

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'global' | 'friends'>('global');

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch('/api/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);
    const currentUserRank = users.findIndex(u => u.id === (session?.user as { id?: string })?.id) + 1;
    const currentUserData = users.find(u => u.id === (session?.user as { id?: string })?.id);

    return (
        <div className="min-h-screen bg-mesh text-white relative overflow-x-hidden">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full glass-panel border-b-0">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#135bec] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(19,91,236,0.5)]">
                                <span className="material-symbols-outlined text-white text-xl sm:text-2xl">school</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">VocabMaster</h1>
                        </div>

                        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                            <a className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" href="/">Öğren</a>
                            <a className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" href="/study/select">Pratik</a>
                            <a className="px-5 py-2 text-sm font-medium text-white bg-[#135bec] shadow-lg shadow-[#135bec]/30 rounded-full" href="/leaderboard">Liderlik</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-white">{session?.user?.name || 'Kullanıcı'}</span>
                                <span className="text-xs text-[#3b82f6] font-medium">Lvl 12 • {currentUserData?.xp || 0} XP</span>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-[#135bec]/50"
                                style={{
                                    backgroundImage: session?.user?.image
                                        ? `url("${session.user.image}")`
                                        : 'linear-gradient(135deg, #135bec, #8b5cf6)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 max-w-[960px] flex flex-col gap-8 pb-32">
                {/* Page Heading & Toggle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-xl">Liderlik Tablosu</h2>
                        <p className="text-slate-400 text-lg font-light">Bu hafta en çok kelimeyi kim öğrendi?</p>
                    </div>

                    {/* Glass Toggle Switch */}
                    <div className="glass-panel p-1.5 rounded-full flex h-14 w-full md:w-auto min-w-[300px]">
                        <label className="cursor-pointer flex-1 relative rounded-full">
                            <input
                                checked={view === 'global'}
                                className="peer sr-only"
                                name="view_mode"
                                type="radio"
                                value="global"
                                onChange={() => setView('global')}
                            />
                            <div className="absolute inset-0 bg-transparent peer-checked:bg-[#135bec] peer-checked:shadow-lg peer-checked:shadow-[#135bec]/40 rounded-full transition-all duration-300 z-0" />
                            <div className="relative z-10 flex items-center justify-center w-full h-full gap-2 text-slate-400 peer-checked:text-white font-medium transition-colors">
                                <span className="material-symbols-outlined text-[20px]">public</span>
                                <span>Genel</span>
                            </div>
                        </label>
                        <label className="cursor-pointer flex-1 relative rounded-full">
                            <input
                                checked={view === 'friends'}
                                className="peer sr-only"
                                name="view_mode"
                                type="radio"
                                value="friends"
                                onChange={() => setView('friends')}
                            />
                            <div className="absolute inset-0 bg-transparent peer-checked:bg-[#135bec] peer-checked:shadow-lg peer-checked:shadow-[#135bec]/40 rounded-full transition-all duration-300 z-0" />
                            <div className="relative z-10 flex items-center justify-center w-full h-full gap-2 text-slate-400 peer-checked:text-white font-medium transition-colors">
                                <span className="material-symbols-outlined text-[20px]">group</span>
                                <span>Arkadaşlar</span>
                            </div>
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium Section */}
                        <div className="py-6 flex justify-center items-end gap-4 md:gap-8 mt-4 min-h-[340px]">
                            {/* Rank 2 */}
                            {top3[1] && (
                                <div className="flex flex-col items-center gap-3 order-1">
                                    <div className="relative group">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-slate-300 font-bold text-xl drop-shadow-md">#2</div>
                                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <div
                                            className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-600 bg-cover bg-center shadow-2xl"
                                            style={{ backgroundImage: top3[1].image ? `url("${top3[1].image}")` : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                        >
                                            <div className="absolute -bottom-3 -right-1 bg-slate-700 p-1.5 rounded-full border-2 border-[#101622] shadow-lg">
                                                <span className="material-symbols-outlined text-slate-300 text-sm md:text-base font-bold">military_tech</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-2">
                                        <p className="text-white text-lg font-bold">{top3[1].name}</p>
                                        <p className="text-indigo-300 text-sm font-medium">{top3[1].xp.toLocaleString()} XP</p>
                                    </div>
                                    <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-t from-slate-800/60 to-slate-800/10 backdrop-blur-md rounded-t-2xl border-t border-x border-white/10 flex items-end justify-center pb-4">
                                        <span className="text-4xl font-bold text-white/10">2</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 1 (Center) */}
                            {top3[0] && (
                                <div className="flex flex-col items-center gap-3 order-2 z-10 -mt-8">
                                    <div className="relative group">
                                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                                            <span className="material-symbols-outlined text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">crown</span>
                                        </div>
                                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-[30px] opacity-30 group-hover:opacity-50 transition-opacity" />
                                        <div
                                            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 bg-cover bg-center shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                                            style={{ backgroundImage: top3[0].image ? `url("${top3[0].image}")` : 'linear-gradient(135deg, #eab308, #f59e0b)' }}
                                        >
                                            <div className="absolute -bottom-3 -right-1 bg-yellow-500 p-1.5 rounded-full border-2 border-[#101622] shadow-lg">
                                                <span className="material-symbols-outlined text-[#101622] text-lg md:text-xl font-bold">emoji_events</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-2">
                                        <p className="text-white text-xl font-bold text-glow">{top3[0].name}</p>
                                        <p className="text-yellow-400 text-base font-medium">{top3[0].xp.toLocaleString()} XP</p>
                                    </div>
                                    <div className="w-28 md:w-40 h-32 md:h-44 bg-gradient-to-t from-[#135bec]/40 to-[#135bec]/10 backdrop-blur-xl rounded-t-2xl border-t border-x border-yellow-500/30 flex items-end justify-center pb-4 shadow-[0_-10px_40px_-10px_rgba(19,91,236,0.3)]">
                                        <span className="text-6xl font-bold text-white/20">1</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 3 */}
                            {top3[2] && (
                                <div className="flex flex-col items-center gap-3 order-3">
                                    <div className="relative group">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-orange-300 font-bold text-xl drop-shadow-md">#3</div>
                                        <div className="absolute inset-0 bg-orange-700 rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <div
                                            className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-700/60 bg-cover bg-center shadow-2xl"
                                            style={{ backgroundImage: top3[2].image ? `url("${top3[2].image}")` : 'linear-gradient(135deg, #c2410c, #ea580c)' }}
                                        >
                                            <div className="absolute -bottom-3 -right-1 bg-orange-800 p-1.5 rounded-full border-2 border-[#101622] shadow-lg">
                                                <span className="material-symbols-outlined text-orange-200 text-sm md:text-base font-bold">military_tech</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-2">
                                        <p className="text-white text-lg font-bold">{top3[2].name}</p>
                                        <p className="text-orange-300 text-sm font-medium">{top3[2].xp.toLocaleString()} XP</p>
                                    </div>
                                    <div className="w-24 md:w-32 h-20 md:h-24 bg-gradient-to-t from-slate-800/60 to-slate-800/10 backdrop-blur-md rounded-t-2xl border-t border-x border-white/10 flex items-end justify-center pb-4">
                                        <span className="text-4xl font-bold text-white/10">3</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List Section */}
                        <div className="flex flex-col gap-3 rounded-3xl md:p-2">
                            {/* Headers */}
                            <div className="flex items-center px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <div className="w-12 text-center">Sıra</div>
                                <div className="flex-1">Kullanıcı</div>
                                <div className="w-24 text-right">XP</div>
                            </div>

                            {/* List Items */}
                            {rest.map((user, index) => (
                                <div key={user.id} className="glass-card rounded-2xl p-4 flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4 md:gap-6 flex-1">
                                        <div className="w-12 text-center text-lg font-bold text-slate-400 group-hover:text-white transition-colors">{index + 4}</div>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-full bg-cover bg-center border border-white/10"
                                                style={{ backgroundImage: user.image ? `url("${user.image}")` : 'linear-gradient(135deg, #64748b, #94a3b8)' }}
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-white font-medium text-base">{user.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#3b82f6] font-bold text-lg">{user.xp.toLocaleString()} XP</p>
                                    </div>
                                </div>
                            ))}

                            {/* Current User Sticky Rank */}
                            {currentUserData && currentUserRank > 3 && (
                                <>
                                    <div className="flex justify-center py-2 opacity-30">
                                        <span className="material-symbols-outlined text-white">more_vert</span>
                                    </div>
                                    <div className="sticky bottom-6 z-30 mt-2">
                                        <div className="relative overflow-hidden rounded-2xl border border-[#135bec]/50 shadow-[0_0_30px_rgba(19,91,236,0.25)]">
                                            <div className="absolute inset-0 bg-[#135bec]/20 backdrop-blur-xl" />
                                            <div className="relative p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4 md:gap-6 flex-1">
                                                    <div className="w-12 text-center text-xl font-black text-white">{currentUserRank}</div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div
                                                                className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-[#135bec]"
                                                                style={{ backgroundImage: session?.user?.image ? `url("${session.user.image}")` : 'linear-gradient(135deg, #135bec, #8b5cf6)' }}
                                                            />
                                                            <div className="absolute -top-1 -right-1 bg-[#135bec] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#101622]">SEN</div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-white font-bold text-lg">{session?.user?.name || 'Kullanıcı'}</p>
                                                            <p className="text-blue-200 text-sm">Harika gidiyorsun! 🚀</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="text-white font-black text-xl tracking-tight">{currentUserData.xp.toLocaleString()} XP</p>
                                                    <div className="flex items-center gap-1 text-xs text-blue-200">
                                                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                                        <span>2 sıra</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
