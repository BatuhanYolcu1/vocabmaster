'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Check, Edit2 } from 'lucide-react';

interface WordInput {
    word: string;
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
    turkishTranslation: string;
    type: string;
}

interface WordList {
    id: string;
    name: string;
    description?: string;
}

const emptyWord: WordInput = {
    word: '',
    definitionTr: '',
    exampleSentence: '',
    exampleSentenceTr: '',
    turkishTranslation: '',
    type: 'noun',
};

export default function AddWordsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const listId = params.id as string;

    const [wordList, setWordList] = useState<WordList | null>(null);
    const [words, setWords] = useState<WordInput[]>([]);
    const [currentWord, setCurrentWord] = useState<WordInput>({ ...emptyWord });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const wordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchList() {
            try {
                const res = await fetch(`/api/wordlists/${listId}`);
                if (res.ok) {
                    const data = await res.json();
                    setWordList(data);
                } else {
                    router.push('/categories');
                }
            } catch {
                router.push('/categories');
            } finally {
                setLoading(false);
            }
        }
        fetchList();
    }, [listId, router]);

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

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            setError('Giriş yapmalısınız');
            return;
        }

        if (words.length === 0) {
            setError('En az bir kelime eklemelisiniz');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/wordlists/${listId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words }),
            });

            if (res.ok) {
                router.push(`/wordlists/${listId}`);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Kelimeler eklenemedi');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 text-center max-w-md">
                    <p className="text-[#92a4c9] mb-4">Kelime eklemek için giriş yapmalısınız</p>
                    <Link href="/login" className="text-[#135bec] hover:underline">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!wordList) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/wordlists/${listId}`}
                        className="p-2 rounded-lg text-[#92a4c9] hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#135bec]">Kelime Ekle</h1>
                        <p className="text-[#92a4c9]">{wordList.name} listesine kelime ekle</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Add Word Form */}
                    <div className="glass-panel rounded-2xl p-6 border border-[#135bec]/30">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-white">
                                {editingIndex !== null ? `Kelime Düzenle` : 'Yeni Kelime'}
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
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-[#6b7b9a] focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
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
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-[#6b7b9a] focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
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
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-[#6b7b9a] focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
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
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-[#6b7b9a] focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
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
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-[#6b7b9a] focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#92a4c9] mb-1">
                                    Kelime Türü
                                </label>
                                <select
                                    value={currentWord.type}
                                    onChange={(e) => updateCurrentWord('type', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white focus:border-[#135bec] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                >
                                    <option value="noun">İsim</option>
                                    <option value="verb">Fiil</option>
                                    <option value="adjective">Sıfat</option>
                                    <option value="adverb">Zarf</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={addOrUpdateWord}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 font-medium"
                                >
                                    {editingIndex !== null ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Güncelle
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Ekle
                                        </>
                                    )}
                                </button>
                                <span className="ml-3 text-xs text-[#6b7b9a]">Ctrl+Enter</span>
                            </div>
                        </div>
                    </div>

                    {/* Added Words List */}
                    {words.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-semibold text-white">Eklenecek Kelimeler ({words.length})</h2>
                            <div className="glass-panel rounded-2xl divide-y divide-white/10">
                                {words.map((word, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-[#6b7b9a] w-6">{index + 1}.</span>
                                                <div>
                                                    <span className="font-medium text-white">{word.word}</span>
                                                    <span className="mx-2 text-[#6b7b9a]">→</span>
                                                    <span className="text-[#92a4c9]">{word.turkishTranslation}</span>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 bg-[#135bec]/20 text-[#135bec] rounded">
                                                    {word.type === 'noun' ? 'İsim' : word.type === 'verb' ? 'Fiil' : word.type === 'adjective' ? 'Sıfat' : 'Zarf'}
                                                </span>
                                            </div>
                                            {word.exampleSentence && (
                                                <p className="text-sm text-[#6b7b9a] mt-1 ml-9 truncate">&quot;{word.exampleSentence}&quot;</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                type="button"
                                                onClick={() => editWord(index)}
                                                className="p-2 text-[#6b7b9a] hover:text-[#135bec] hover:bg-[#135bec]/10 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeWord(index)}
                                                className="p-2 text-[#6b7b9a] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving || words.length === 0}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-violet-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_30px_rgba(19,91,236,0.4)] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            {saving ? 'Kaydediliyor...' : `${words.length} Kelimeyi Listeye Ekle`}
                        </button>
                        <Link
                            href={`/wordlists/${listId}`}
                            className="px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold hover:bg-white/20 transition-colors"
                        >
                            İptal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
