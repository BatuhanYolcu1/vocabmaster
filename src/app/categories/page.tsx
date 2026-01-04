'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    wordCount: number;
    color: string;
}

interface WordList {
    id: string;
    name: string;
    description: string;
    _count: { items: number };
    createdAt: string;
}

const defaultCategories: Category[] = [
    { id: '1', slug: 'general', name: 'Genel', description: 'Günlük hayatta kullanılan temel kelimeler', icon: 'menu_book', wordCount: 0, color: 'from-blue-500 to-blue-700' },
    { id: '2', slug: 'business', name: 'İş Dünyası', description: 'Profesyonel iş hayatı terimleri', icon: 'business_center', wordCount: 0, color: 'from-purple-500 to-purple-700' },
    { id: '3', slug: 'travel', name: 'Seyahat', description: 'Havalimanı, otel ve restoran diyalogları', icon: 'flight', wordCount: 0, color: 'from-orange-500 to-orange-700' },
    { id: '4', slug: 'academic', name: 'Akademik', description: 'Akademik makaleler ve sınavlar için', icon: 'school', wordCount: 0, color: 'from-green-500 to-green-700' },
    { id: '5', slug: 'technology', name: 'Teknoloji', description: 'Yazılım ve teknoloji terimleri', icon: 'computer', wordCount: 0, color: 'from-cyan-500 to-cyan-700' },
    { id: '6', slug: 'health', name: 'Sağlık', description: 'Tıbbi terimler ve sağlık ifadeleri', icon: 'health_and_safety', wordCount: 0, color: 'from-pink-500 to-pink-700' },
];

export default function CategoriesPage() {
    const { data: session } = useSession();
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [catRes, listsRes] = await Promise.all([
                    fetch('/api/words/categories'),
                    session ? fetch('/api/wordlists') : Promise.resolve(null)
                ]);

                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (catData.length > 0) {
                        setCategories(catData);
                    }
                }

                if (listsRes && listsRes.ok) {
                    const listsData = await listsRes.json();
                    setWordLists(listsData);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [session]);

    const totalWords = wordLists.reduce((acc, list) => acc + (list._count?.items || 0), 0);

    return (
        <div className="min-h-screen bg-[#101622] text-white font-['Lexend'] relative overflow-x-hidden">
            {/* Background Ambient Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#135bec] rounded-full blur-[80px] opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#4f46e5] rounded-full blur-[80px] opacity-40" />
                <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-[#0ea5e9] rounded-full blur-[100px] opacity-20" />
            </div>

            {/* Main Layout */}
            <div className="relative z-10 flex h-screen w-full overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-72 h-full glass-panel border-r border-white/5">
                    <div className="flex flex-col h-full p-6">
                        {/* Branding */}
                        <div className="flex items-center gap-3 mb-10 px-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#135bec] to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-white text-[24px]">school</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">VocabMaster</h1>
                        </div>

                        {/* User Profile Snippet */}
                        {session && (
                            <div className="flex items-center gap-3 mb-8 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-[#135bec]/50"
                                    style={{
                                        backgroundImage: session?.user?.image
                                            ? `url("${session.user.image}")`
                                            : 'linear-gradient(135deg, #135bec, #8b5cf6)'
                                    }}
                                />
                                <div className="flex flex-col">
                                    <p className="text-white text-sm font-medium leading-none">{session.user?.name || 'Kullanıcı'}</p>
                                    <p className="text-blue-200 text-xs font-normal mt-1">Premium Üye</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kütüphane</p>
                            <Link href="/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl glass-active transition-colors group">
                                <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform">dashboard</span>
                                <p className="text-sm font-medium">Genel Görünüm</p>
                            </Link>
                            <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">favorite</span>
                                <p className="text-gray-300 group-hover:text-white text-sm font-medium transition-colors">Favoriler</p>
                            </Link>

                            <div className="h-px bg-white/10 my-4 mx-3" />

                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategoriler</p>
                            {categories.slice(0, 3).map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/categories/${cat.slug}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-white">{cat.icon}</span>
                                    <p className="text-gray-300 group-hover:text-white text-sm font-medium">{cat.name}</p>
                                </Link>
                            ))}
                        </div>

                        {/* Bottom Action */}
                        <Link
                            href="/wordlists/new"
                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-12 bg-[#135bec] hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Yeni Liste</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Top Header */}
                    <header className="h-20 flex items-center justify-between px-8 py-4 border-b border-white/5 glass-panel sticky top-0 z-20">
                        <button className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full mr-4">
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#135bec] transition-colors">search</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-2.5 bg-[#1e293b]/50 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#135bec]/50 focus:bg-[#1e293b]/80 transition-all"
                                    placeholder="Kelime listelerinde ara..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-6">
                            <button className="relative p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#111722]" />
                            </button>
                            <button className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Page Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
                            {/* Page Heading */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight text-glow">Kelime Listelerim</h2>
                                    <p className="text-blue-200/70 text-base font-light">
                                        Toplam {wordLists.length} liste ve {totalWords} kelime ile öğrenme yolculuğun devam ediyor.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href="/wordlists/import"
                                        className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">file_upload</span>
                                        <span>İçe Aktar</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <button className="flex items-center justify-center h-9 px-5 rounded-full bg-white text-[#135bec] text-sm font-bold shadow-lg shadow-white/10 transition-transform active:scale-95 whitespace-nowrap">
                                    Tümü
                                </button>
                                <button className="flex items-center justify-center h-9 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all whitespace-nowrap">
                                    Devam Edenler
                                </button>
                                <button className="flex items-center justify-center h-9 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all whitespace-nowrap">
                                    Tamamlananlar
                                </button>
                                <button className="flex items-center justify-center h-9 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all whitespace-nowrap">
                                    <span className="material-symbols-outlined text-base mr-1.5 text-pink-500">favorite</span>
                                    Favoriler
                                </button>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Create New List Card */}
                                <Link
                                    href="/wordlists/new"
                                    className="group flex flex-col items-center justify-center h-full min-h-[320px] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all hover:border-[#135bec]/50"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#135bec]/20 flex items-center justify-center mb-4 transition-colors">
                                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#135bec] transition-colors">add</span>
                                    </div>
                                    <p className="text-white text-lg font-bold">Yeni Liste Oluştur</p>
                                    <p className="text-gray-400 text-sm mt-1">Kendi kelime setini hazırla</p>
                                </Link>

                                {/* User Word Lists */}
                                {wordLists.map((list) => (
                                    <Link
                                        key={list.id}
                                        href={`/wordlists/${list.id}`}
                                        className="glass-card rounded-2xl overflow-hidden flex flex-col group p-5 relative min-h-[300px]"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <span className="material-symbols-outlined text-gray-500 hover:text-pink-500 transition-colors cursor-pointer">favorite</span>
                                        </div>
                                        <div className="mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec] mb-3">
                                                <span className="material-symbols-outlined">folder</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-[#135bec] transition-colors">{list.name}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-6 flex-1">{list.description || 'Özel kelime listem'}</p>
                                        <div className="space-y-3">
                                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                                <div className="bg-gradient-to-r from-[#135bec] to-blue-500 h-1.5 rounded-full" style={{ width: '30%' }} />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{list._count?.items || 0} Kelime</span>
                                                <span className="text-white font-medium">%30</span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 group-hover:bg-[#135bec] group-hover:border-[#135bec]/50">
                                            <span>Çalış</span>
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </Link>
                                ))}

                                {/* System Categories */}
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/categories/${cat.slug}`}
                                        className="glass-card rounded-2xl overflow-hidden flex flex-col group p-5 relative min-h-[300px]"
                                    >
                                        <div className="mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                                                <span className="material-symbols-outlined">{cat.icon}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-[#135bec] transition-colors">{cat.name}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-6 flex-1">{cat.description}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-white/5">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">format_list_numbered</span>
                                                {cat.wordCount} Kelime
                                            </span>
                                            <button className="bg-[#135bec] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-blue-900/20">
                                                Başla
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating Action Button (Mobile) */}
                    <Link
                        href="/wordlists/new"
                        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#135bec] text-white rounded-full shadow-2xl flex items-center justify-center z-50"
                    >
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </Link>
                </main>
            </div>
        </div>
    );
}
