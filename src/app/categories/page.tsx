'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WordList {
    id: string;
    name: string;
    description: string;
    _count: { items: number };
    studiedCount?: number;
    masteredCount?: number;
    createdAt: string;
    updatedAt: string;
}

export default function CategoriesPage() {
    const { data: session } = useSession();
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!session) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/wordlists');
                if (res.ok) {
                    const data = await res.json();
                    setWordLists(data);
                }
            } catch (error) {
                console.error('Failed to fetch lists:', error);
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
                    <div className="flex gap-3">
                        <Link
                            href="/wordlists/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Yeni Liste
                        </Link>
                    </div>
                </div>

                {/* Word Lists */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin" />
                        </div>
                    ) : !session ? (
                        <div className="glass-panel rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#135bec]/20 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-[#135bec]">login</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Giriş Yapın</h3>
                            <p className="text-[#8b9bb4] mb-8 max-w-md mx-auto">
                                Kelime listelerinizi görmek için giriş yapmanız gerekiyor.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                            >
                                Giriş Yap
                            </Link>
                        </div>
                    ) : wordLists.length === 0 ? (
                        <div className="glass-panel rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#135bec]/20 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-[#135bec]">folder_open</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Henüz liste yok</h3>
                            <p className="text-[#8b9bb4] mb-8 max-w-md mx-auto">
                                İlk kelime listeni oluştur ve öğrenmeye başla!
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
                                        <div className="flex-1 mr-4">
                                            {(() => {
                                                const total = list._count?.items || 0;
                                                const studied = (list as WordList).studiedCount || 0;
                                                const pct = total > 0 ? Math.round((studied / total) * 100) : 0;
                                                return (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-[10px]">
                                                            <span className="text-[#8b9bb4]">{studied}/{total} öğrenildi</span>
                                                            <span className="text-[#135bec] font-bold">%{pct}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#135bec] to-blue-400 rounded-full transition-all duration-500"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
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
            </div>
        </div>
    );
}
