'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ExploreWord {
    id: string;
    word: string;
    turkishTranslation: string;
    type: string;
    level: string;
    category: string;
    exampleSentence: string;
}

interface WordList {
    id: string;
    name: string;
    _count: { items: number };
}

interface CategoryInfo {
    name: string;
    count: number;
}

interface LevelInfo {
    name: string;
    count: number;
}

const LEVEL_COLORS: Record<string, string> = {
    A1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    A2: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
    B1: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    B2: 'bg-[#135bec]/20 text-[#135bec] border-[#135bec]/20',
    C1: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    C2: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
};

const CATEGORY_ICONS: Record<string, string> = {
    'Genel': 'language',
    'İş': 'business_center',
    'Akademik': 'school',
    'Teknoloji': 'computer',
    'Seyahat': 'flight',
    'Sağlık': 'health_and_safety',
};

export default function ExplorePage() {
    const { data: session } = useSession();
    const [words, setWords] = useState<ExploreWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Word list selection for adding
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [addResult, setAddResult] = useState<{ added: number; total: number } | null>(null);

    const fetchWords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '30',
            });
            if (selectedCategory !== 'all') params.set('category', selectedCategory);
            if (selectedLevel !== 'all') params.set('level', selectedLevel);
            if (searchQuery.trim()) params.set('q', searchQuery.trim());

            const res = await fetch(`/api/explore?${params}`);
            if (res.ok) {
                const data = await res.json();
                setWords(data.words);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                if (data.categories) setCategories(data.categories);
                if (data.levels) setLevels(data.levels);
            }
        } catch (error) {
            console.error('Error fetching words:', error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, selectedLevel, searchQuery]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    useEffect(() => {
        async function fetchLists() {
            if (!session) return;
            try {
                const res = await fetch('/api/wordlists');
                if (res.ok) setWordLists(await res.json());
            } catch (e) { console.error(e); }
        }
        fetchLists();
    }, [session]);

    const toggleWord = (wordId: string) => {
        setSelectedWords(prev => {
            const next = new Set(prev);
            if (next.has(wordId)) next.delete(wordId);
            else next.add(wordId);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedWords.size === words.length) {
            setSelectedWords(new Set());
        } else {
            setSelectedWords(new Set(words.map(w => w.id)));
        }
    };

    const handleAddToList = async () => {
        if (!selectedListId || selectedWords.size === 0) return;
        setAdding(true);
        try {
            const res = await fetch('/api/explore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wordIds: Array.from(selectedWords),
                    listId: selectedListId,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setAddResult(data);
                setSelectedWords(new Set());
                setTimeout(() => {
                    setShowAddModal(false);
                    setAddResult(null);
                }, 2000);
            }
        } catch (error) {
            console.error('Error adding words:', error);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <span className="material-symbols-outlined text-cyan-400">explore</span>
                            Kelimeleri Keşfet
                        </h1>
                        <p className="text-[#8b9bb4]">
                            {total} kelime arasından ara ve listene ekle
                        </p>
                    </div>
                    {selectedWords.size > 0 && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">playlist_add</span>
                            {selectedWords.size} Kelimeyi Ekle
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="glass-panel rounded-2xl p-4 mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8b9bb4]">search</span>
                        <input
                            type="text"
                            placeholder="Kelime veya anlam ara..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-[#1a2332]/60 rounded-xl border border-white/10 text-white placeholder:text-[#8b9bb4] focus:border-cyan-500/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => { setSelectedCategory('all'); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-[#8b9bb4] border border-white/10 hover:bg-white/10'}`}
                            >
                                Tümü
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedCategory === cat.name ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-[#8b9bb4] border border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{CATEGORY_ICONS[cat.name] || 'category'}</span>
                                    {cat.name} ({cat.count})
                                </button>
                            ))}
                        </div>

                        {/* Level Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => { setSelectedLevel('all'); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLevel === 'all' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-[#8b9bb4] border border-white/10 hover:bg-white/10'}`}
                            >
                                Tüm Seviyeler
                            </button>
                            {levels.sort((a, b) => a.name.localeCompare(b.name)).map(lvl => (
                                <button
                                    key={lvl.name}
                                    onClick={() => { setSelectedLevel(lvl.name); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLevel === lvl.name ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-[#8b9bb4] border border-white/10 hover:bg-white/10'}`}
                                >
                                    {lvl.name} ({lvl.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Select All */}
                {words.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={selectAll}
                            className="text-xs text-[#8b9bb4] hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {selectedWords.size === words.length ? 'deselect' : 'select_all'}
                            </span>
                            {selectedWords.size === words.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                        </button>
                        <span className="text-xs text-[#8b9bb4]">
                            Sayfa {page}/{totalPages}
                        </span>
                    </div>
                )}

                {/* Words Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
                                <div className="h-5 bg-white/10 rounded w-24 mb-3" />
                                <div className="h-4 bg-white/5 rounded w-32 mb-2" />
                                <div className="h-3 bg-white/5 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : !session ? (
                    <div className="glass-panel rounded-3xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#135bec] mb-4">login</span>
                        <h3 className="text-2xl font-bold mb-3">Giriş Gerekli</h3>
                        <p className="text-[#8b9bb4] mb-6">Kelimeleri keşfetmek için giriş yapın.</p>
                        <Link href="/login" className="px-8 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 rounded-xl text-white font-bold">Giriş Yap</Link>
                    </div>
                ) : words.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#8b9bb4] mb-4">search_off</span>
                        <h3 className="text-xl font-bold mb-2">Kelime Bulunamadı</h3>
                        <p className="text-[#8b9bb4]">Filtrelerinizi değiştirmeyi deneyin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {words.map(word => {
                            const isSelected = selectedWords.has(word.id);
                            return (
                                <button
                                    key={word.id}
                                    onClick={() => toggleWord(word.id)}
                                    className={`text-left p-4 rounded-2xl border transition-all duration-200 ${isSelected
                                        ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                        : 'glass-panel hover:bg-[#232f48]/60 hover:border-white/15'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-white">{word.word}</h3>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[word.level] || 'bg-white/10 text-white/60 border-white/10'}`}>
                                                {word.level}
                                            </span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'}`}>
                                            {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                        </div>
                                    </div>
                                    <p className="text-sm text-cyan-400 font-medium mb-1">{word.turkishTranslation}</p>
                                    <p className="text-xs text-[#8b9bb4] italic line-clamp-1">{word.exampleSentence}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-[#8b9bb4] bg-white/5 px-2 py-0.5 rounded">{word.type}</span>
                                        <span className="text-[10px] text-[#8b9bb4] bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">{CATEGORY_ICONS[word.category] || 'category'}</span>
                                            {word.category}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl glass-button text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ← Önceki
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = page <= 3 ? i + 1 : page + i - 2;
                                if (pageNum < 1 || pageNum > totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === pageNum
                                            ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                            : 'glass-button text-[#8b9bb4] hover:text-white'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl glass-button text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Sonraki →
                        </button>
                    </div>
                )}
            </div>

            {/* Add to List Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel rounded-3xl p-8 max-w-md w-full relative animate-fadeIn">
                        <button
                            onClick={() => { setShowAddModal(false); setAddResult(null); }}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#92a4c9] hover:text-white hover:bg-white/10 transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        {addResult ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Eklendi!</h3>
                                <p className="text-[#8b9bb4]">{addResult.added} kelime listeye eklendi.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-cyan-400">playlist_add</span>
                                    Listeye Ekle
                                </h2>
                                <p className="text-sm text-[#8b9bb4] mb-6">{selectedWords.size} kelime eklenecek</p>

                                {wordLists.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-[#8b9bb4] mb-4">Henüz kelime listen yok.</p>
                                        <Link href="/wordlists/new" className="px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 rounded-xl text-white font-bold inline-block">
                                            Liste Oluştur
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                                            {wordLists.map(list => (
                                                <button
                                                    key={list.id}
                                                    onClick={() => setSelectedListId(list.id)}
                                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${selectedListId === list.id
                                                        ? 'border-cyan-500/30 bg-cyan-500/10'
                                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{list.name}</p>
                                                        <p className="text-[#8b9bb4] text-xs">{list._count?.items || 0} kelime</p>
                                                    </div>
                                                    {selectedListId === list.id && (
                                                        <span className="material-symbols-outlined text-cyan-400">check_circle</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleAddToList}
                                            disabled={!selectedListId || adding}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {adding ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">add</span>
                                                    Ekle
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
