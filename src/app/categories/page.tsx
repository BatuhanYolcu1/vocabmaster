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
    { id: '1', slug: 'general', name: 'Genel', description: 'Günlük hayatta kullanılan temel kelimeler', icon: 'menu_book', wordCount: 100, color: 'from-blue-500 to-blue-700' },
    { id: '2', slug: 'business', name: 'İş Dünyası', description: 'Profesyonel iş hayatı terimleri', icon: 'business_center', wordCount: 100, color: 'from-purple-500 to-purple-700' },
    { id: '3', slug: 'travel', name: 'Seyahat', description: 'Havalimanı, otel ve restoran diyalogları', icon: 'flight', wordCount: 100, color: 'from-orange-500 to-orange-700' },
    { id: '4', slug: 'academic', name: 'Akademik', description: 'Akademik makaleler ve sınavlar için', icon: 'school', wordCount: 100, color: 'from-green-500 to-green-700' },
    { id: '5', slug: 'technology', name: 'Teknoloji', description: 'Yazılım ve teknoloji terimleri', icon: 'computer', wordCount: 100, color: 'from-cyan-500 to-cyan-700' },
    { id: '6', slug: 'health', name: 'Sağlık', description: 'Tıbbi terimler ve sağlık ifadeleri', icon: 'health_and_safety', wordCount: 100, color: 'from-pink-500 to-pink-700' },
];


export default function CategoriesPage() {
    const { data: session } = useSession();
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my-lists' | 'categories'>('my-lists');

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
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Kelime Listeleri</h1>
                        <p className="text-[#8b9bb4]">
                            {wordLists.length} liste • {totalWords} kelime
                        </p>
                    </div>
                    <Link
                        href="/wordlists/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Yeni Liste
                    </Link>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 p-1 bg-[#1a2332]/80 rounded-full w-fit border border-white/5">
                    <button
                        onClick={() => setActiveTab('my-lists')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'my-lists'
                            ? 'bg-[#135bec] text-white shadow-[0_0_15px_rgba(19,91,236,0.4)]'
                            : 'text-[#8b9bb4] hover:text-white'
                            }`}
                    >
                        Listelerim
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'categories'
                            ? 'bg-[#135bec] text-white shadow-[0_0_15px_rgba(19,91,236,0.4)]'
                            : 'text-[#8b9bb4] hover:text-white'
                            }`}
                    >
                        Hazır Kategoriler
                    </button>
                </div>

                {/* My Lists Tab */}
                {activeTab === 'my-lists' && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin" />
                            </div>
                        ) : wordLists.length === 0 ? (
                            <div className="glass-panel rounded-3xl p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#135bec]/20 flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl text-[#135bec]">folder_open</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Henüz liste yok</h3>
                                <p className="text-[#8b9bb4] mb-8 max-w-md mx-auto">
                                    İlk kelime listeni oluştur ve öğrenmeye başla. Kendi kelimelerini ekleyebilir veya hazır kategorilerden seçebilirsin.
                                </p>
                                <Link
                                    href="/wordlists/new"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    İlk Listeni Oluştur
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wordLists.map((list) => (
                                    <Link
                                        key={list.id}
                                        href={`/wordlists/${list.id}`}
                                        className="glass-card rounded-2xl p-5 group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                                                <span className="material-symbols-outlined">folder</span>
                                            </div>
                                            <span className="text-xs text-[#8b9bb4] bg-white/5 px-2 py-1 rounded-lg">
                                                {list._count?.items || 0} kelime
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#135bec] transition-colors">
                                            {list.name}
                                        </h3>
                                        <p className="text-sm text-[#8b9bb4] line-clamp-2 mb-4">
                                            {list.description || 'Özel kelime listem'}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-[#8b9bb4]">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                <span>Son güncelleme</span>
                                            </div>
                                            <span className="material-symbols-outlined text-[#8b9bb4] group-hover:text-[#135bec] group-hover:translate-x-1 transition-all">
                                                arrow_forward
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="glass-card rounded-2xl p-5 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined">{cat.icon}</span>
                                    </div>
                                    <span className="text-xs text-[#8b9bb4] bg-white/5 px-2 py-1 rounded-lg">
                                        {cat.wordCount} kelime
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#135bec] transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-sm text-[#8b9bb4] line-clamp-2 mb-4">
                                    {cat.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button className="text-xs font-medium text-[#135bec] hover:underline">
                                        Başla →
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
