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

// Unique custom icons as inline SVGs
const CustomIcons = {
    flashcard: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M19 9l3-3M19 15l3 3M5 9L2 6M5 15l-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </svg>
    ),
    quiz: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1.5-1.5 2-1.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
    ),
    typing: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 10h1M8 10h1M11 10h2M16 10h1M19 10h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 13h2M8 13h1M11 13h2M15 13h2M18 13h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    matching: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <rect x="2" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="15" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="15" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="15" y="15" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 6.5h2.5a2 2 0 012 2v7a2 2 0 01-2 2H9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M15 17.5h-2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    listening: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <path d="M3 12a9 9 0 1118 0" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 12v5a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H3zM21 12v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1" />
        </svg>
    ),
    speaking: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <path d="M12 2a3.5 3.5 0 00-3.5 3.5v5a3.5 3.5 0 007 0v-5A3.5 3.5 0 0012 2z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19 10v.5a7 7 0 01-14 0V10M12 17.5V22M8 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15.5 6l2.5-1M15.5 8.5l2 .5M15.5 11l2.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </svg>
    )
};

const studyModes = [
    {
        id: 'flashcard',
        name: 'Beyin Kartları',
        icon: 'flashcard',
        description: 'Çevir, düşün, hatırla',
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
        glow: 'rgba(56, 189, 248, 0.4)',
        tag: '⚡ Klasik'
    },
    {
        id: 'multiple-choice',
        name: 'Bilgi Yarışması',
        icon: 'quiz',
        description: '4 seçenek, 1 doğru cevap',
        gradient: 'from-emerald-400 via-green-500 to-teal-600',
        glow: 'rgba(52, 211, 153, 0.4)',
        tag: '🎯 Test Et'
    },
    {
        id: 'typing',
        name: 'Parmak Hafızası',
        icon: 'typing',
        description: 'Yazarak kalıcı öğren',
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
        glow: 'rgba(167, 139, 250, 0.4)',
        tag: '⌨️ Aktif'
    },
    {
        id: 'matching',
        name: 'Zihin Labirenti',
        icon: 'matching',
        description: 'Bağlantıları keşfet',
        gradient: 'from-amber-400 via-orange-500 to-rose-600',
        glow: 'rgba(251, 146, 60, 0.4)',
        tag: '🧩 Bulmaca'
    },
];

export default function StudySelectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [step, setStep] = useState<'list' | 'mode'>('list');
    const [hoveredMode, setHoveredMode] = useState<string | null>(null);

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
        <div className="min-h-screen bg-[#0a0d14] text-white relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Floating Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-purple-500/15 blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[50%] left-[50%] w-[20vw] h-[20vw] rounded-full bg-rose-500/10 blur-[60px] animate-pulse" style={{ animationDuration: '5s' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-10">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-3 mb-16">
                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all ${step === 'list' ? 'bg-white/10 backdrop-blur-sm border border-white/20' : 'opacity-50'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${step === 'list' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-white/20'}`}>
                            ①
                        </div>
                        <span className="text-sm font-semibold">Koleksiyon</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full transition-all ${step === 'mode' ? 'bg-cyan-400' : 'bg-white/20'}`} />
                        <div className={`w-8 h-0.5 transition-all ${step === 'mode' ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-white/20'}`} />
                        <div className={`w-2 h-2 rounded-full transition-all ${step === 'mode' ? 'bg-purple-500' : 'bg-white/20'}`} />
                    </div>
                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all ${step === 'mode' ? 'bg-white/10 backdrop-blur-sm border border-white/20' : 'opacity-50'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${step === 'mode' ? 'bg-gradient-to-br from-purple-400 to-rose-600' : 'bg-white/20'}`}>
                            ②
                        </div>
                        <span className="text-sm font-semibold">Deneyim</span>
                    </div>
                </div>

                {/* Step 1: List Selection */}
                {step === 'list' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-medium mb-4">
                                <span>◈</span> KELİME KOLEKSİYONU
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-4">
                                Hangi koleksiyonla başlayalım?
                            </h1>
                            <p className="text-[#6b7a94] max-w-md mx-auto">
                                Hedefine uygun öğrenme serüvenine bir adım daha yakınsın
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full" />
                                    <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-cyan-500 rounded-full animate-spin" />
                                </div>
                                <p className="text-[#6b7a94] text-sm">Koleksiyonlar yükleniyor...</p>
                            </div>
                        ) : !session ? (
                            <div className="max-w-md mx-auto">
                                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl text-center">
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan-500/5 to-purple-500/5 opacity-50" />
                                    <div className="relative">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                            <span className="text-3xl">🔐</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Giriş Gerekli</h3>
                                        <p className="text-[#6b7a94] mb-6">Öğrenme yolculuğuna başlamak için hesabına giriş yap</p>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                                        >
                                            <span>➜</span> Giriş Yap
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : wordLists.length === 0 ? (
                            <div className="max-w-md mx-auto">
                                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl text-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                            <span className="text-3xl">📚</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">İlk Adım</h3>
                                        <p className="text-[#6b7a94] mb-6">Öğrenmeye başlamak için bir kelime koleksiyonu oluştur</p>
                                        <Link
                                            href="/wordlists/new"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
                                        >
                                            <span>✦</span> Koleksiyon Oluştur
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wordLists.map((list, idx) => (
                                    <button
                                        key={list.id}
                                        onClick={() => handleListSelect(list.id)}
                                        disabled={list._count?.items === 0}
                                        className={`group relative p-5 rounded-2xl border transition-all duration-300 text-left ${list._count?.items === 0
                                            ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/2'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] cursor-pointer'
                                            }`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                                <span className="text-lg">◎</span>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider text-[#6b7a94] bg-white/5 px-2 py-1 rounded-lg font-semibold">
                                                {list._count?.items || 0} kelime
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                            {list.name}
                                        </h3>
                                        <p className="text-xs text-[#6b7a94] line-clamp-2">
                                            {list.description || 'Kişisel koleksiyon'}
                                        </p>
                                        {list._count?.items === 0 && (
                                            <div className="mt-2 text-[10px] text-amber-400/80 flex items-center gap-1">
                                                <span>⚠</span> Kelime eklenmemiş
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Mode Selection */}
                {step === 'mode' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center mb-10">
                            <button
                                onClick={() => setStep('list')}
                                className="inline-flex items-center gap-2 text-[#6b7a94] hover:text-white transition-colors mb-6 text-sm"
                            >
                                <span>←</span> Koleksiyona dön
                            </button>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium mb-4">
                                <span>◈</span> {selectedListData?.name}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-4">
                                Öğrenme deneyimini seç
                            </h1>
                            <p className="text-[#6b7a94] max-w-md mx-auto">
                                Her mod farklı bir öğrenme stili sunar, hangisi sana uygun?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                            {studyModes.map((mode, idx) => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeSelect(mode.id)}
                                    onMouseEnter={() => setHoveredMode(mode.id)}
                                    onMouseLeave={() => setHoveredMode(null)}
                                    className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm text-left transition-all duration-500 hover:border-white/20"
                                    style={{
                                        animationDelay: `${idx * 100}ms`,
                                        boxShadow: hoveredMode === mode.id ? `0 0 60px ${mode.glow}` : 'none'
                                    }}
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                                                <div className="w-full h-full rounded-2xl bg-[#0a0d14] flex items-center justify-center text-white">
                                                    {CustomIcons[mode.icon as keyof typeof CustomIcons]}
                                                </div>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider text-white/60 bg-white/10 px-3 py-1.5 rounded-full font-semibold">
                                                {mode.tag}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                                            {mode.name}
                                        </h3>
                                        <p className="text-sm text-[#6b7a94] group-hover:text-[#8b9bb4] transition-colors">
                                            {mode.description}
                                        </p>

                                        {/* Arrow indicator */}
                                        <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                            <span className="text-sm">→</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
