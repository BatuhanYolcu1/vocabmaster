'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WordList {
    id: string;
    name: string;
    description: string;
    _count: { items: number };
}

const studyModes = [
    { id: 'flashcard', name: 'Flashcard', icon: 'style', description: 'Kartlarla öğren', color: 'from-blue-500 to-blue-600' },
    { id: 'multiple-choice', name: 'Quiz', icon: 'quiz', description: 'Kendini test et', color: 'from-green-500 to-green-600' },
    { id: 'typing', name: 'Yazarak Öğren', icon: 'keyboard', description: 'Yazarak pekiştir', color: 'from-purple-500 to-purple-600' },
    { id: 'matching', name: 'Eşleştirme', icon: 'compare_arrows', description: 'Kelimeleri eşleştir', color: 'from-orange-500 to-orange-600' },
];

export default function StudySelectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [step, setStep] = useState<'list' | 'mode'>('list');

    useEffect(() => {
        async function fetchLists() {
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
        fetchLists();
    }, [session]);

    const handleListSelect = (listId: string) => {
        setSelectedList(listId);
        setStep('mode');
    };

    const handleModeSelect = (modeId: string) => {
        if (!selectedList) return;
        router.push(`/study/${modeId}?listId=${selectedList}`);
    };

    const selectedListData = wordLists.find(l => l.id === selectedList);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className={`flex items-center gap-2 ${step === 'list' ? 'text-[#135bec]' : 'text-[#8b9bb4]'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'list' ? 'bg-[#135bec] text-white' : 'bg-white/10'}`}>
                            1
                        </div>
                        <span className="font-medium">Liste Seç</span>
                    </div>
                    <div className="w-12 h-0.5 bg-white/10" />
                    <div className={`flex items-center gap-2 ${step === 'mode' ? 'text-[#135bec]' : 'text-[#8b9bb4]'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'mode' ? 'bg-[#135bec] text-white' : 'bg-white/10'}`}>
                            2
                        </div>
                        <span className="font-medium">Mod Seç</span>
                    </div>
                </div>

                {/* Step 1: List Selection */}
                {step === 'list' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-white mb-2">Hangi Listeyle Çalışmak İstiyorsun?</h1>
                            <p className="text-[#8b9bb4]">Pratik yapmak için bir kelime listesi seç</p>
                        </div>

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
                                <p className="text-[#8b9bb4] mb-8">Pratik yapmak için giriş yapmanız gerekiyor.</p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold"
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
                                <p className="text-[#8b9bb4] mb-8">Pratik yapmak için önce bir kelime listesi oluştur.</p>
                                <Link
                                    href="/wordlists/new"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Yeni Liste Oluştur
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wordLists.map((list) => (
                                    <button
                                        key={list.id}
                                        onClick={() => handleListSelect(list.id)}
                                        disabled={list._count?.items === 0}
                                        className={`glass-card rounded-2xl p-5 text-left group transition-all ${list._count?.items === 0
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:border-[#135bec]/50 cursor-pointer'
                                            }`}
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
                                        <p className="text-sm text-[#8b9bb4] line-clamp-2">
                                            {list.description || 'Özel kelime listem'}
                                        </p>
                                        {list._count?.items === 0 && (
                                            <p className="text-xs text-orange-400 mt-2">Bu listede kelime yok</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Mode Selection */}
                {step === 'mode' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <button
                                onClick={() => setStep('list')}
                                className="inline-flex items-center gap-1 text-[#8b9bb4] hover:text-white transition-colors mb-4"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Geri
                            </button>
                            <h1 className="text-3xl font-black text-white mb-2">Nasıl Çalışmak İstiyorsun?</h1>
                            <p className="text-[#8b9bb4]">
                                <span className="text-[#135bec] font-medium">{selectedListData?.name}</span> listesiyle pratik yap
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studyModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeSelect(mode.id)}
                                    className="glass-card rounded-2xl p-6 text-left group hover:border-[#135bec]/50 transition-all"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-2xl">{mode.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#135bec] transition-colors">
                                        {mode.name}
                                    </h3>
                                    <p className="text-[#8b9bb4]">{mode.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
