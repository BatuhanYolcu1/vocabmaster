'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserStats {
    wordsLearned: number;
    totalXP: number;
    streak: number;
    level: number;
    quizzesTaken: number;
    accuracy: number;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<UserStats>({
        wordsLearned: 0,
        totalXP: 0,
        streak: 0,
        level: 1,
        quizzesTaken: 0,
        accuracy: 0
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        wordsLearned: data.wordsLearned || 0,
                        totalXP: data.totalXP || session?.user?.xp || 0,
                        streak: data.streak || 0,
                        level: Math.floor((data.totalXP || 0) / 1000) + 1,
                        quizzesTaken: data.quizzesTaken || 0,
                        accuracy: data.accuracy || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        if (session) fetchStats();
    }, [session]);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white font-['Lexend'] relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="glass-panel rounded-3xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div
                                className="w-28 h-28 rounded-full bg-cover bg-center border-4 border-[#135bec]/50 shadow-[0_0_30px_rgba(19,91,236,0.3)]"
                                style={{
                                    backgroundImage: session?.user?.image
                                        ? `url("${session.user.image}")`
                                        : 'linear-gradient(135deg, #135bec, #8b5cf6)'
                                }}
                            />
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-4 border-[#0b0f17]">
                                <span className="text-sm font-bold text-black">{stats.level}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{session?.user?.name || 'Kullanıcı'}</h1>
                            <p className="text-[#92a4c9] mb-4">{session?.user?.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full bg-[#135bec]/20 text-[#135bec] text-sm font-medium border border-[#135bec]/20">
                                    Premium Üye
                                </span>
                                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/20 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">local_fire_department</span>
                                    {stats.streak} Gün Seri
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <button className="px-6 py-2.5 rounded-xl glass-button text-white font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Düzenle
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-card rounded-2xl p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#135bec]/20 flex items-center justify-center text-[#135bec] mx-auto mb-3">
                            <span className="material-symbols-outlined">star</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
                        <p className="text-sm text-[#92a4c9]">Toplam XP</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mx-auto mb-3">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.wordsLearned}</p>
                        <p className="text-sm text-[#92a4c9]">Öğrenilen</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-3">
                            <span className="material-symbols-outlined">quiz</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.quizzesTaken}</p>
                        <p className="text-sm text-[#92a4c9]">Quiz</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3">
                            <span className="material-symbols-outlined">target</span>
                        </div>
                        <p className="text-2xl font-bold text-white">%{stats.accuracy}</p>
                        <p className="text-sm text-[#92a4c9]">Doğruluk</p>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="glass-panel rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Hızlı Erişim</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/achievements" className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">emoji_events</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">Başarımlar</p>
                                <p className="text-[#92a4c9] text-sm">Rozetlerini görüntüle</p>
                            </div>
                            <span className="material-symbols-outlined text-[#92a4c9] group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                        </Link>
                        <Link href="/categories" className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec] group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">folder</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">Kelime Listeleri</p>
                                <p className="text-[#92a4c9] text-sm">Listelerini yönet</p>
                            </div>
                            <span className="material-symbols-outlined text-[#92a4c9] group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                        </Link>
                        <Link href="/leaderboard" className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">leaderboard</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">Liderlik Tablosu</p>
                                <p className="text-[#92a4c9] text-sm">Sıralamana bak</p>
                            </div>
                            <span className="material-symbols-outlined text-[#92a4c9] group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                        </Link>
                        <Link href="/study/modes" className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">play_circle</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">Pratik Yap</p>
                                <p className="text-[#92a4c9] text-sm">Çalışmaya başla</p>
                            </div>
                            <span className="material-symbols-outlined text-[#92a4c9] group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
