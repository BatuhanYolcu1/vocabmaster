'use client';

import { useEffect, useState, useCallback } from 'react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    type: string;
    level: string;
    category: string;
    exampleSentence: string;
}

export default function AdminWordsPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showAdd, setShowAdd] = useState(false);
    const [newWord, setNewWord] = useState({ word: '', turkishTranslation: '', type: 'noun', level: 'B1', category: 'Genel', exampleSentence: '' });
    const [saving, setSaving] = useState(false);

    const fetchWords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString() });
            if (search) params.set('q', search);
            const res = await fetch(`/api/admin/words?${params}`);
            if (res.ok) {
                const data = await res.json();
                setWords(data.words);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchWords(); }, [fetchWords]);

    const addWord = async () => {
        if (!newWord.word.trim() || !newWord.turkishTranslation.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWord),
            });
            if (res.ok) {
                setShowAdd(false);
                setNewWord({ word: '', turkishTranslation: '', type: 'noun', level: 'B1', category: 'Genel', exampleSentence: '' });
                fetchWords();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const deleteWord = async (wordId: string) => {
        if (!confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) return;
        try {
            await fetch('/api/admin/words', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wordId }),
            });
            fetchWords();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400">dictionary</span>
                        Sistem Kelimeleri
                    </h1>
                    <p className="text-[#8b9bb4] mt-1">{total} kelime</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Kelime Ekle
                </button>
            </div>

            {/* Add Word Form */}
            {showAdd && (
                <div className="bg-[#111827]/60 border border-emerald-500/20 rounded-2xl p-6 animate-fadeIn">
                    <h3 className="text-white font-bold mb-4">Yeni Kelime</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <input placeholder="İngilizce" value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-[#8b9bb4] focus:outline-none focus:border-emerald-500/50" />
                        <input placeholder="Türkçe" value={newWord.turkishTranslation} onChange={e => setNewWord({ ...newWord, turkishTranslation: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-[#8b9bb4] focus:outline-none focus:border-emerald-500/50" />
                        <input placeholder="Örnek cümle" value={newWord.exampleSentence} onChange={e => setNewWord({ ...newWord, exampleSentence: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-[#8b9bb4] focus:outline-none focus:border-emerald-500/50" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <select value={newWord.type} onChange={e => setNewWord({ ...newWord, type: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none">
                            {['noun', 'verb', 'adjective', 'adverb', 'preposition'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={newWord.level} onChange={e => setNewWord({ ...newWord, level: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none">
                            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select value={newWord.category} onChange={e => setNewWord({ ...newWord, category: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none">
                            {['Genel', 'İş', 'Akademik', 'Teknoloji', 'Seyahat', 'Sağlık'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button onClick={addWord} disabled={saving} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm disabled:opacity-50">
                        {saving ? 'Ekleniyor...' : 'Kaydet'}
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8b9bb4]">search</span>
                <input type="text" placeholder="Kelime ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-[#111827]/60 rounded-xl border border-white/10 text-white placeholder:text-[#8b9bb4] focus:border-[#135bec]/50 focus:outline-none text-sm" />
            </div>

            {/* Words Table */}
            <div className="bg-[#111827]/60 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5">
                        <tr className="text-[10px] uppercase tracking-widest text-[#8b9bb4]">
                            <th className="px-5 py-4 font-bold">Kelime</th>
                            <th className="px-5 py-4 font-bold">Çeviri</th>
                            <th className="px-5 py-4 font-bold">Tür</th>
                            <th className="px-5 py-4 font-bold">Seviye</th>
                            <th className="px-5 py-4 font-bold">Kategori</th>
                            <th className="px-5 py-4 font-bold w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                            ))
                        ) : words.map(w => (
                            <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-3.5 text-white font-medium text-sm">{w.word}</td>
                                <td className="px-5 py-3.5 text-[#8b9bb4] text-sm">{w.turkishTranslation}</td>
                                <td className="px-5 py-3.5 text-[#8b9bb4] text-xs">{w.type}</td>
                                <td className="px-5 py-3.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">{w.level}</span></td>
                                <td className="px-5 py-3.5 text-[#8b9bb4] text-xs">{w.category}</td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => deleteWord(w.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
