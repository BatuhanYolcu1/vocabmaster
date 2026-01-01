'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BookOpen, Home, BarChart3, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [xp, setXp] = useState(0);

    // Sync state with session initial data
    useEffect(() => {
        if (session?.user?.xp !== undefined) {
            setXp(session.user.xp);
        }
    }, [session]);

    // Fetch fresh XP from API
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

        // Fetch on mount and path change
        fetchXp();

        // Listen for XP update events
        const handleXpUpdate = () => fetchXp();
        window.addEventListener('xp-updated', handleXpUpdate);

        return () => window.removeEventListener('xp-updated', handleXpUpdate);
    }, [session, pathname]);

    // Landing Page Navbar (Unauthenticated)
    if (!session && status !== 'loading') {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                VocabMaster
                            </span>
                        </Link>

                        {/* Auth Buttons Only */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-5 py-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg"
                            >
                                Ücretsiz Başla
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    // Dashboard Navbar (Authenticated)
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            VocabMaster
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        <Link
                            href="/"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pathname === '/'
                                ? 'text-indigo-600 bg-indigo-50 font-medium'
                                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Ana Sayfa</span>
                        </Link>
                        <Link
                            href="/categories"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pathname === '/categories'
                                ? 'text-indigo-600 bg-indigo-50 font-medium'
                                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Listeler</span>
                        </Link>
                        <Link
                            href="/study"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pathname.startsWith('/study')
                                ? 'text-indigo-600 bg-indigo-50 font-medium'
                                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Çalış</span>
                        </Link>

                        {/* Auth Section (Authenticated) */}
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                {/* XP Badge */}
                                <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                                    <span>⭐</span>
                                    <span>{xp} XP</span>
                                </div>

                                {/* Profile Link */}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                    {session?.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Profil"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    )}
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    title="Çıkış Yap"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
