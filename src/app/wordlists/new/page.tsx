'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Sparkles } from 'lucide-react';

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
    const [words, setWords] = useState<WordInput[]>([{ ...emptyWord }]);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState<number | null>(null);
    const [error, setError] = useState('');

    const generateDetails = async (index: number) => {
        const word = words[index].word.trim();
        if (!word) return;

        setGenerating(index);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word }),
            });

            if (res.ok) {
                const data = await res.json();
                const newWords = [...words];
                newWords[index] = { ...newWords[index], ...data };
                setWords(newWords);
            } else {
                if (res.status === 503) {
                    setError('AI servisi için API anahtarı eksik. Lütfen .env dosyanızı kontrol edin.');
                } else {
                    setError('Kelime detayları oluşturulamadı.');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Bir hata oluştu.');
        } finally {
            setGenerating(null);
        }
    };

    const addWord = () => {
        setWords([...words, { ...emptyWord }]);
    };

    const removeWord = (index: number) => {
        if (words.length > 1) {
            setWords(words.filter((_, i) => i !== index));
        }
    };

    const updateWord = (index: number, field: keyof WordInput, value: string) => {
        const newWords = [...words];
        newWords[index] = { ...newWords[index], [field]: value };
        setWords(newWords);
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

                {/* Words */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Kelimeler ({words.length})</h2>
                        <button
                            type="button"
                            onClick={addWord}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Kelime Ekle
                        </button>
                    </div>

                    {words.map((word, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-500">Kelime {index + 1}</span>
                                {words.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeWord(index)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        İngilizce Kelime *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={word.word}
                                            onChange={(e) => updateWord(index, 'word', e.target.value)}
                                            placeholder="resilient"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateDetails(index)}
                                            disabled={generating === index || !word.word.trim()}
                                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg hover:from-violet-600 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
                                            title="AI ile Otomatik Doldur"
                                        >
                                            {generating === index ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                            <span className="hidden sm:inline">AI Doldur</span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Türkçe Anlamı *
                                    </label>
                                    <input
                                        type="text"
                                        value={word.turkishTranslation}
                                        onChange={(e) => updateWord(index, 'turkishTranslation', e.target.value)}
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
                                        value={word.definitionTr}
                                        onChange={(e) => updateWord(index, 'definitionTr', e.target.value)}
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
                                        value={word.exampleSentence}
                                        onChange={(e) => updateWord(index, 'exampleSentence', e.target.value)}
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
                                        value={word.exampleSentenceTr}
                                        onChange={(e) => updateWord(index, 'exampleSentenceTr', e.target.value)}
                                        placeholder="O çok dayanıklı."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kelime Türü
                                    </label>
                                    <select
                                        value={word.type}
                                        onChange={(e) => updateWord(index, 'type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="noun">İsim</option>
                                        <option value="verb">Fiil</option>
                                        <option value="adjective">Sıfat</option>
                                        <option value="adverb">Zarf</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
                        disabled={saving}
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
