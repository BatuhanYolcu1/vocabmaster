'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [xp, setXp] = useState(0);

    useEffect(() => {
        if (session?.user?.xp !== undefined) {
            setXp(session.user.xp);
        }
    }, [session]);

    useEffect(() => {
        const fetchXp = async () => {
            if (!session) return;
            try {
                const res = await fetch('/api/xp');
                if (res.ok) {
                    const data = await res.json();
                    setXp(data.xp);
                }
            } catch (error) {
                console.error('Failed to fetch XP:', error);
            }
        };

        fetchXp();
        const handleXpUpdate = () => fetchXp();
        window.addEventListener('xp-updated', handleXpUpdate);
        return () => window.removeEventListener('xp-updated', handleXpUpdate);
    }, [session, pathname]);

    // Landing Page Navbar (Unauthenticated)
    if (!session && status !== 'loading') {
        return (
            <header className="fixed top-4 left-0 right-0 z-50 mx-4 md:mx-10">
                <nav className="bg-[#0d1321]/90 backdrop-blur-xl rounded-full px-6 py-3 max-w-[1200px] mx-auto border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between whitespace-nowrap">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3 text-white">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_0_20px_rgba(19,91,236,0.5)]">
                                    <span className="material-symbols-outlined text-white text-[20px]">school</span>
                                </div>
                                <h2 className="text-white text-xl font-bold leading-tight tracking-tight">VocabMaster</h2>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 font-medium transition-all"
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                            >
                                Ücretsiz Başla
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }

    // Dashboard Navbar (Authenticated)
    return (
        <header className="fixed top-4 left-0 right-0 z-50 mx-4 md:mx-10">
            <nav className="bg-[#0d1321]/90 backdrop-blur-xl rounded-full px-6 py-3 max-w-[1400px] mx-auto border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between whitespace-nowrap">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 text-white">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_0_20px_rgba(19,91,236,0.5)]">
                                <span className="material-symbols-outlined text-white text-[20px]">school</span>
                            </div>
                            <h2 className="text-white text-xl font-bold leading-tight tracking-tight">VocabMaster</h2>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1 ml-4 bg-[#1a2332]/80 rounded-full p-1 border border-white/5">
                            <Link
                                href="/"
                                className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${pathname === '/'
                                    ? 'text-white bg-[#135bec] shadow-[0_0_20px_rgba(19,91,236,0.5)]'
                                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Ana Sayfa
                            </Link>
                            <Link
                                href="/categories"
                                className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${pathname === '/categories'
                                    ? 'text-white bg-[#135bec] shadow-[0_0_20px_rgba(19,91,236,0.5)]'
                                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Kelimeler
                            </Link>
                            <Link
                                href="/study/modes"
                                className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${pathname.startsWith('/study')
                                    ? 'text-white bg-[#135bec] shadow-[0_0_20px_rgba(19,91,236,0.5)]'
                                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Pratik
                            </Link>
                            <Link
                                href="/leaderboard"
                                className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${pathname === '/leaderboard'
                                    ? 'text-white bg-[#135bec] shadow-[0_0_20px_rgba(19,91,236,0.5)]'
                                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Liderlik
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <label className="hidden md:flex items-center min-w-40 h-10 max-w-64 bg-[#1a2332]/80 rounded-full border border-white/5 px-4 group focus-within:border-[#135bec]/50 transition-colors">
                            <span className="material-symbols-outlined text-[#8b9bb4] group-focus-within:text-[#135bec] transition-colors text-[20px]">search</span>
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-[#8b9bb4] ml-2 outline-none"
                                placeholder="Kelime ara..."
                            />
                        </label>

                        {/* XP Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                            <span className="material-symbols-outlined text-orange-400 text-lg">local_fire_department</span>
                            <span className="text-sm font-bold text-orange-400">{xp}</span>
                        </div>

                        {/* Notifications */}
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
                            <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0d1321]"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                        {/* User Profile */}
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-[#1a2332] animate-pulse" />
                        ) : (
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                            >
                                <div
                                    className="w-8 h-8 rounded-full bg-cover bg-center border-2 border-white/20 group-hover:border-[#135bec] transition-colors"
                                    style={{
                                        backgroundImage: session?.user?.image
                                            ? `url("${session.user.image}")`
                                            : 'linear-gradient(135deg, #135bec, #8b5cf6)'
                                    }}
                                />
                                <span className="text-sm font-medium hidden sm:block text-white">
                                    {session?.user?.name?.split(' ')[0] || 'Kullanıcı'}
                                </span>
                                <span className="material-symbols-outlined text-[#8b9bb4] text-[18px]">expand_more</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
