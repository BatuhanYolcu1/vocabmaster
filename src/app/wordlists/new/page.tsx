'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Check, Edit2 } from 'lucide-react';

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
            // Update existing word
            const newWords = [...words];
            newWords[editingIndex] = { ...currentWord };
            setWords(newWords);
            setEditingIndex(null);
        } else {
            // Add new word
            setWords([...words, { ...currentWord }]);
        }

        // Clear form and focus
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
                body: JSON.stringify({
                    name,
                    description,
                    words: validWords,
                }),
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
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <p className="text-gray-600 mb-4">Liste oluşturmak için giriş yapmalısınız</p>
                <Link href="/auth/signin" className="text-indigo-600 hover:underline">
                    Giriş Yap
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/categories"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Yeni Kelime Listesi</h1>
                    <p className="text-gray-600">Kendi kelimelerini ekle ve çalış</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* List Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4">Liste Bilgileri</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Liste Adı *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Örn: IELTS Kelimeleri"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Açıklama (Opsiyonel)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Liste hakkında kısa açıklama"
                                rows={2}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Add Word Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">
                            {editingIndex !== null ? `Kelime Düzenle` : 'Yeni Kelime Ekle'}
                        </h2>
                        {editingIndex !== null && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                İptal
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                İngilizce Kelime *
                            </label>
                            <input
                                ref={wordInputRef}
                                type="text"
                                value={currentWord.word}
                                onChange={(e) => updateCurrentWord('word', e.target.value)}
                                placeholder="resilient"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        e.preventDefault();
                                        addOrUpdateWord();
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Türkçe Anlamı *
                            </label>
                            <input
                                type="text"
                                value={currentWord.turkishTranslation}
                                onChange={(e) => updateCurrentWord('turkishTranslation', e.target.value)}
                                placeholder="Dayanıklı, esnek"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Türkçe Tanım
                            </label>
                            <input
                                type="text"
                                value={currentWord.definitionTr}
                                onChange={(e) => updateCurrentWord('definitionTr', e.target.value)}
                                placeholder="Zorluklardan hızla toparlanabilen"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Örnek Cümle (İngilizce)
                            </label>
                            <input
                                type="text"
                                value={currentWord.exampleSentence}
                                onChange={(e) => updateCurrentWord('exampleSentence', e.target.value)}
                                placeholder="She is very resilient."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Örnek Cümle (Türkçe)
                            </label>
                            <input
                                type="text"
                                value={currentWord.exampleSentenceTr}
                                onChange={(e) => updateCurrentWord('exampleSentenceTr', e.target.value)}
                                placeholder="O çok dayanıklı."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kelime Türü
                            </label>
                            <select
                                value={currentWord.type}
                                onChange={(e) => updateCurrentWord('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
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
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-medium"
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
                            <span className="ml-3 text-xs text-gray-400">Ctrl+Enter</span>
                        </div>
                    </div>
                </div>

                {/* Added Words List */}
                {words.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-gray-900">Eklenen Kelimeler ({words.length})</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                            {words.map((word, index) => (
                                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-400 w-6">{index + 1}.</span>
                                            <div>
                                                <span className="font-medium text-gray-900">{word.word}</span>
                                                <span className="mx-2 text-gray-300">→</span>
                                                <span className="text-gray-600">{word.turkishTranslation}</span>
                                            </div>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                                                {word.type === 'noun' ? 'İsim' : word.type === 'verb' ? 'Fiil' : word.type === 'adjective' ? 'Sıfat' : 'Zarf'}
                                            </span>
                                        </div>
                                        {word.exampleSentence && (
                                            <p className="text-sm text-gray-400 mt-1 ml-9 truncate">&quot;{word.exampleSentence}&quot;</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => editWord(index)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Düzenle"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeWord(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving || words.length === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Kaydediliyor...' : 'Listeyi Kaydet'}
                    </button>
                    <Link
                        href="/categories"
                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        İptal
                    </Link>
                </div>
            </form>
        </div>
    );
}
