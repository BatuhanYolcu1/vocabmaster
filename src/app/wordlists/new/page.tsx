'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WordInput {
    word: string;
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
    turkishTranslation: string;
    type: string;
}

const emptyWord: WordInput = {
    word: '',
    definitionTr: '',
    exampleSentence: '',
    exampleSentenceTr: '',
    turkishTranslation: '',
    type: 'noun',
};

export default function NewWordListPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [words, setWords] = useState<WordInput[]>([]);
    const [currentWord, setCurrentWord] = useState<WordInput>({ ...emptyWord });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const wordInputRef = useRef<HTMLInputElement>(null);

    const addOrUpdateWord = () => {
        if (!currentWord.word.trim() || !currentWord.turkishTranslation.trim()) {
            setError('İngilizce kelime ve Türkçe anlamı gereklidir.');
            return;
        }

        if (editingIndex !== null) {
            const newWords = [...words];
            newWords[editingIndex] = { ...currentWord };
            setWords(newWords);
            setEditingIndex(null);
        } else {
            setWords([...words, { ...currentWord }]);
        }

        setCurrentWord({ ...emptyWord });
        setError('');
        wordInputRef.current?.focus();
    };

    const editWord = (index: number) => {
        setCurrentWord({ ...words[index] });
        setEditingIndex(index);
        wordInputRef.current?.focus();
    };

    const cancelEdit = () => {
        setCurrentWord({ ...emptyWord });
        setEditingIndex(null);
    };

    const removeWord = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setCurrentWord({ ...emptyWord });
            setEditingIndex(null);
        }
    };

    const updateCurrentWord = (field: keyof WordInput, value: string) => {
        setCurrentWord({ ...currentWord, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            setError('Giriş yapmalısınız');
            return;
        }

        if (!name.trim()) {
            setError('Liste adı gerekli');
            return;
        }

        const validWords = words.filter(w => w.word.trim() && w.turkishTranslation.trim());
        if (validWords.length === 0) {
            setError('En az bir kelime eklemelisiniz');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/wordlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, words: validWords }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/wordlists/${data.id}`);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Liste oluşturulamadı');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="glass-panel rounded-3xl p-8 text-center">
                    <p className="text-[#92a4c9] mb-4">Liste oluşturmak için giriş yapmalısınız</p>
                    <Link href="/login" className="text-[#135bec] hover:text-blue-400 transition-colors">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/categories"
                        className="p-2 rounded-xl glass-button text-[#92a4c9] hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Yeni Kelime Listesi</h1>
                        <p className="text-[#92a4c9]">Kendi kelimelerini ekle ve çalış</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* List Info */}
                    <div className="glass-panel rounded-2xl p-6">
                        <h2 className="font-semibold text-white mb-4">Liste Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-2">
                                    Liste Adı *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Örn: IELTS Kelimeleri"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-2">
                                    Açıklama (Opsiyonel)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Liste hakkında kısa açıklama"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Word Form */}
                    <div className="glass-panel rounded-2xl p-6 border border-[#135bec]/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-white">
                                {editingIndex !== null ? `Kelime Düzenle` : 'Yeni Kelime Ekle'}
                            </h2>
                            {editingIndex !== null && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-sm text-[#92a4c9] hover:text-white transition-colors"
                                >
                                    İptal
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    İngilizce Kelime *
                                </label>
                                <input
                                    ref={wordInputRef}
                                    type="text"
                                    value={currentWord.word}
                                    onChange={(e) => updateCurrentWord('word', e.target.value)}
                                    placeholder="resilient"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            e.preventDefault();
                                            addOrUpdateWord();
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Türkçe Anlamı *
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.turkishTranslation}
                                    onChange={(e) => updateCurrentWord('turkishTranslation', e.target.value)}
                                    placeholder="Dayanıklı, esnek"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Türkçe Tanım
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.definitionTr}
                                    onChange={(e) => updateCurrentWord('definitionTr', e.target.value)}
                                    placeholder="Zorluklardan hızla toparlanabilen"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Örnek Cümle (İngilizce)
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.exampleSentence}
                                    onChange={(e) => updateCurrentWord('exampleSentence', e.target.value)}
                                    placeholder="She is very resilient."
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Örnek Cümle (Türkçe)
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.exampleSentenceTr}
                                    onChange={(e) => updateCurrentWord('exampleSentenceTr', e.target.value)}
                                    placeholder="O çok dayanıklı."
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Kelime Türü
                                </label>
                                <select
                                    value={currentWord.type}
                                    onChange={(e) => updateCurrentWord('type', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#135bec]/50"
                                >
                                    <option value="noun" className="bg-[#0b0f17]">İsim</option>
                                    <option value="verb" className="bg-[#0b0f17]">Fiil</option>
                                    <option value="adjective" className="bg-[#0b0f17]">Sıfat</option>
                                    <option value="adverb" className="bg-[#0b0f17]">Zarf</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={addOrUpdateWord}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">{editingIndex !== null ? 'check' : 'add'}</span>
                                    {editingIndex !== null ? 'Güncelle' : 'Ekle'}
                                </button>
                                <span className="ml-3 text-xs text-slate-500">Ctrl+Enter</span>
                            </div>
                        </div>
                    </div>

                    {/* Added Words List */}
                    {words.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-semibold text-white">Eklenen Kelimeler ({words.length})</h2>
                            <div className="glass-panel rounded-2xl divide-y divide-white/5">
                                {words.map((word, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-slate-500 w-6">{index + 1}.</span>
                                                <div>
                                                    <span className="font-medium text-white">{word.word}</span>
                                                    <span className="mx-2 text-slate-600">→</span>
                                                    <span className="text-[#92a4c9]">{word.turkishTranslation}</span>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 bg-white/5 text-slate-400 rounded border border-white/5">
                                                    {word.type === 'noun' ? 'İsim' : word.type === 'verb' ? 'Fiil' : word.type === 'adjective' ? 'Sıfat' : 'Zarf'}
                                                </span>
                                            </div>
                                            {word.exampleSentence && (
                                                <p className="text-sm text-slate-500 mt-1 ml-9 truncate">&quot;{word.exampleSentence}&quot;</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                type="button"
                                                onClick={() => editWord(index)}
                                                className="p-2 text-slate-500 hover:text-[#135bec] hover:bg-[#135bec]/10 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeWord(index)}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving || words.length === 0}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-2xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">save</span>
                            {saving ? 'Kaydediliyor...' : 'Listeyi Kaydet'}
                        </button>
                        <Link
                            href="/categories"
                            className="px-8 py-4 glass-button text-white rounded-2xl font-medium"
                        >
                            İptal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
