'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Edit, Trash2, Plus } from 'lucide-react';

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
            const res = await fetch(`/api/wordlists/${listId}`, {
                method: 'DELETE',
            });
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
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="space-y-2 mt-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!wordList) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/categories"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{wordList.name}</h1>
                        {wordList.description && (
                            <p className="text-gray-600">{wordList.description}</p>
                        )}
                        <p className="text-sm text-indigo-600 font-medium mt-1">
                            {wordList.words.length} kelime
                        </p>
                    </div>
                </div>

                {session && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
                <Link
                    href={`/study?list=${listId}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg"
                >
                    <Play className="w-5 h-5" />
                    Bu Listeyle Çalış
                </Link>
                <Link
                    href={`/wordlists/${listId}/add`}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Kelime Ekle
                </Link>
            </div>

            {/* Words List */}
            <div className="space-y-3">
                {wordList.words.map((word) => (
                    <div
                        key={word.id}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{word.word}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                        {word.type}
                                    </span>
                                </div>
                                <p className="text-indigo-600 font-medium">{word.turkishTranslation}</p>
                                {word.definitionTr && (
                                    <p className="text-sm text-gray-500 mt-1">{word.definitionTr}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {wordList.words.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <p className="text-gray-500 mb-4">Bu listede henüz kelime yok</p>
                        <Link
                            href={`/wordlists/${listId}/add`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Kelime Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
