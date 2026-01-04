'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    definitionTr: string;
    type: string;
}

interface WordList {
    id: string;
    name: string;
    description?: string;
    words: Word[];
}

export default function WordListDetailPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const listId = params.id as string;

    const [wordList, setWordList] = useState<WordList | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = async () => {
        if (!confirm('Bu listeyi silmek istediğinize emin misiniz?')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/wordlists/${listId}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/categories');
            }
        } catch {
            // Ignore
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    if (!wordList) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/categories"
                            className="p-2 rounded-xl glass-button text-[#92a4c9] hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{wordList.name}</h1>
                            {wordList.description && (
                                <p className="text-[#92a4c9] mt-1">{wordList.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/wordlists/${listId}/add`}
                            className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Kelime Ekle
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-2 rounded-xl glass-button text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Listeyi Sil"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <Link
                        href={`/study/flashcard?list=${listId}`}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">play_circle</span>
                        Flashcard İle Çalış
                    </Link>
                    <Link
                        href={`/study/multiple-choice?list=${listId}`}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 glass-button text-white rounded-2xl font-medium"
                    >
                        <span className="material-symbols-outlined text-2xl">quiz</span>
                        Test İle Çalış
                    </Link>
                </div>

                {/* Word Count */}
                <div className="glass-panel rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                            <p className="text-white font-medium">{wordList.words.length} Kelime</p>
                            <p className="text-[#92a4c9] text-sm">Bu listede</p>
                        </div>
                    </div>
                </div>

                {/* Words List */}
                {wordList.words.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-400">inbox</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz kelime yok</h3>
                        <p className="text-[#92a4c9] mb-6">Bu listeye kelime ekleyerek başlayın</p>
                        <Link
                            href={`/wordlists/${listId}/add`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Kelime Ekle
                        </Link>
                    </div>
                ) : (
                    <div className="glass-panel rounded-2xl divide-y divide-white/5">
                        {wordList.words.map((word, index) => (
                            <div key={word.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <span className="text-xs font-medium text-slate-500 w-6">{index + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-medium text-white">{word.word}</span>
                                            <span className="text-slate-600">→</span>
                                            <span className="text-[#92a4c9]">{word.turkishTranslation}</span>
                                            <span className="text-xs px-2 py-0.5 bg-white/5 text-slate-400 rounded border border-white/5">
                                                {word.type === 'noun' ? 'İsim' : word.type === 'verb' ? 'Fiil' : word.type === 'adjective' ? 'Sıfat' : 'Zarf'}
                                            </span>
                                        </div>
                                        {word.definitionTr && (
                                            <p className="text-sm text-slate-500 truncate">{word.definitionTr}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="material-symbols-outlined text-lg">volume_up</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
