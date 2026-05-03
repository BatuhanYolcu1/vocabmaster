'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
    wordId: string;
    word: string;
    translation: string;
    type: string;
    level: string;
    listId: string;
    listName: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [xp, setXp] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

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

    // Debounced search
    const searchWords = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchWords(searchQuery);
                setShowSearchResults(true);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchWords]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [session]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleSearchResultClick = (result: SearchResult) => {
        setShowSearchResults(false);
        setSearchQuery('');
        router.push(`/lists/${result.listId}`);
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Landing Page Navbar (Unauthenticated) - Light theme to match landing page
    if (!session && status !== 'loading') {
        return (
            <header className="fixed top-4 left-0 right-0 z-50 mx-4 md:mx-10">
                <nav className="bg-[#0d1321]/80 backdrop-blur-xl rounded-full px-6 py-3 max-w-[1200px] mx-auto border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between whitespace-nowrap">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_0_20px_rgba(19,91,236,0.5)]">
                                    <span className="material-symbols-outlined text-white text-[20px]">school</span>
                                </div>
                                <h2 className="text-white text-xl font-bold leading-tight tracking-tight">VocabMaster</h2>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-5 py-2.5 rounded-full text-[#8b9bb4] hover:text-white hover:bg-white/5 font-medium transition-all"
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_2px_12px_rgba(19,91,236,0.4)] hover:shadow-[0_4px_20px_rgba(19,91,236,0.5)] transition-all"
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
                                href="/study/select"
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
                        <div className="relative hidden md:block">
                            <label className="flex items-center min-w-40 h-10 max-w-64 bg-[#1a2332]/80 rounded-full border border-white/5 px-4 group focus-within:border-[#135bec]/50 transition-colors">
                                <span className="material-symbols-outlined text-[#8b9bb4] group-focus-within:text-[#135bec] transition-colors text-[20px]">
                                    {isSearching ? 'sync' : 'search'}
                                </span>
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-[#8b9bb4] ml-2 outline-none"
                                    placeholder="Kelime ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                />
                            </label>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-12 left-0 right-0 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {searchResults.map((result) => (
                                        <button
                                            key={`${result.wordId}-${result.listId}`}
                                            onClick={() => handleSearchResultClick(result)}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                        >
                                            <span className="material-symbols-outlined text-[#135bec] text-lg">translate</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium truncate">{result.word}</div>
                                                <div className="text-[#8b9bb4] text-xs truncate">{result.translation}</div>
                                            </div>
                                            <span className="text-xs text-[#8b9bb4] bg-white/5 px-2 py-1 rounded-full">{result.listName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                <div className="absolute top-12 left-0 right-0 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                                    <p className="text-[#8b9bb4] text-sm text-center">Sonuç bulunamadı</p>
                                </div>
                            )}
                        </div>

                        {/* XP Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                            <span className="material-symbols-outlined text-orange-400 text-lg">local_fire_department</span>
                            <span className="text-sm font-bold text-orange-400">{xp}</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                            >
                                <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute top-12 right-0 w-80 bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                        <span className="text-white font-medium">Bildirimler</span>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-[#135bec] hover:text-blue-400 transition-colors"
                                            >
                                                Tümünü okundu işaretle
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <span className="material-symbols-outlined text-[#8b9bb4] text-4xl mb-2">notifications_off</span>
                                                <p className="text-[#8b9bb4] text-sm">Bildirim yok</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <button
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${!notification.read ? 'bg-[#135bec]/10' : ''
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg mt-0.5 ${notification.type === 'achievement_unlocked' ? 'text-yellow-400' :
                                                        notification.type === 'level_up' ? 'text-green-400' :
                                                            notification.type === 'streak_reminder' ? 'text-orange-400' :
                                                                'text-blue-400'
                                                        }`}>
                                                        {notification.type === 'achievement_unlocked' ? 'emoji_events' :
                                                            notification.type === 'level_up' ? 'trending_up' :
                                                                notification.type === 'streak_reminder' ? 'local_fire_department' :
                                                                    'schedule'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-white text-sm font-medium">{notification.title}</div>
                                                        <div className="text-[#8b9bb4] text-xs mt-0.5 line-clamp-2">{notification.message}</div>
                                                        <div className="text-[#8b9bb4]/60 text-xs mt-1">
                                                            {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                                                        </div>
                                                    </div>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-[#135bec] rounded-full mt-1.5"></span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                        {/* User Profile Dropdown */}
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-[#1a2332] animate-pulse" />
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                                    <span className={`material-symbols-outlined text-[#8b9bb4] text-[18px] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-48 py-2 rounded-2xl bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[#135bec]">person</span>
                                                <span className="text-sm font-medium">Profilim</span>
                                            </Link>
                                            <Link
                                                href="/statistics"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-purple-400">monitoring</span>
                                                <span className="text-sm font-medium">İstatistikler</span>
                                            </Link>
                                            <div className="h-[1px] bg-white/10 mx-3 my-1" />
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    signOut();
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">logout</span>
                                                <span className="text-sm font-medium">Çıkış Yap</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            aria-label="Menüyü aç"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed top-20 left-4 right-4 z-50 lg:hidden animate-fadeIn">
                        <div className="bg-[#0d1321]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-6 space-y-2">
                            {/* Nav Links */}
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${pathname === '/' ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">home</span>
                                <span className="font-medium">Ana Sayfa</span>
                            </Link>
                            <Link
                                href="/categories"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${pathname === '/categories' ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                                <span className="font-medium">Kelimeler</span>
                            </Link>
                            <Link
                                href="/study/select"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${pathname.startsWith('/study') ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                <span className="font-medium">Pratik</span>
                            </Link>
                            <Link
                                href="/leaderboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${pathname === '/leaderboard' ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                                <span className="font-medium">Liderlik</span>
                            </Link>
                            <Link
                                href="/achievements"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${pathname === '/achievements' ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                                <span className="font-medium">Başarımlar</span>
                            </Link>

                            {/* Divider */}
                            <div className="h-px bg-white/10 my-2" />

                            {/* User Info */}
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white/20"
                                    style={{
                                        backgroundImage: session?.user?.image
                                            ? `url("${session.user.image}")`
                                            : 'linear-gradient(135deg, #135bec, #8b5cf6)'
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm">{session?.user?.name || 'Kullanıcı'}</p>
                                    <p className="text-orange-400 text-xs font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                                        {xp} XP
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#8b9bb4] hover:bg-white/5 hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                <span className="font-medium">Profilim</span>
                            </Link>
                            <Link
                                href="/statistics"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#8b9bb4] hover:bg-white/5 hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px] text-purple-400">monitoring</span>
                                <span className="font-medium">İstatistikler</span>
                            </Link>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signOut();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                <span className="font-medium">Çıkış Yap</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
