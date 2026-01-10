'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import RatingButtons from '@/components/RatingButtons';
import { useStudyStore } from '@/lib/store';
import Link from 'next/link';

function FlashcardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listId = searchParams.get('listId');

    const {
        isSessionActive,
        cards,
        currentIndex,
        isFlipped,
        startSession,
        flipCard,
        rateCard,
        stats,
    } = useStudyStore();
    const [loading, setLoading] = useState(true);
    const [sessionStarted, setSessionStarted] = useState(false);

    useEffect(() => {
        // Redirect if no listId
        if (!listId) {
            router.push('/study/select');
            return;
        }

        async function initSession() {
            // Always start a fresh session when page loads
            if (!sessionStarted) {
                try {
                    const res = await fetch(`/api/words?listId=${listId}&limit=20`);
                    if (res.ok) {
                        const words = await res.json();
                        if (words.length > 0) {
                            startSession(words);
                            setSessionStarted(true);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch words', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        initSession();
    }, [sessionStarted, startSession, listId, router]);


    useEffect(() => {
        if (!isSessionActive && cards.length > 0 && !loading && stats) {
            // Pass stats via URL parameters
            const params = new URLSearchParams({
                total: stats.totalWords.toString(),
                hard: stats.hardCount.toString(),
                good: stats.goodCount.toString(),
                easy: stats.easyCount.toString(),
                start: stats.startTime,
                end: stats.endTime || new Date().toISOString(),
            });
            router.push(`/study/complete?${params.toString()}`);
        }
    }, [isSessionActive, cards.length, loading, router, stats]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flipCard();
            } else if (isFlipped) {
                if (e.key === '1') rateCard('hard');
                else if (e.key === '2') rateCard('good');
                else if (e.key === '3') rateCard('easy');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, flipCard, rateCard]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Çalışma oturumu yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">inbox</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Çalışılacak Kelime Yok</h2>
                    <p className="text-[#92a4c9] mb-8">
                        Henüz hiç kelime eklenmemiş veya çalışma hedefine uygun kelime bulunamadı.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/wordlists/new"
                            className="px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                        >
                            Kelime Ekle
                        </Link>
                        <Link
                            href="/categories"
                            className="px-6 py-3 glass-button text-white rounded-xl font-medium"
                        >
                            Listelere Git
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    if (!currentCard) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/study/select"
                        className="flex items-center gap-2 text-[#92a4c9] hover:text-white transition-colors group"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Çıkış</span>
                    </Link>
                    <div className="glass-panel px-4 py-2 rounded-full text-sm text-[#92a4c9]">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono mr-2">Space</kbd>
                        Çevir
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#92a4c9]">İlerleme</span>
                        <span className="text-sm font-medium text-white">{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-[#135bec] shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Flashcard Area */}
                <div className="relative perspective-1000 mb-8">
                    <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={flipCard} />
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    {isFlipped ? (
                        <RatingButtons onRate={rateCard} />
                    ) : (
                        <button
                            onClick={flipCard}
                            className="w-full max-w-sm px-8 py-4 bg-gradient-to-r from-purple-500 to-[#135bec] text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Cevabı Göster
                        </button>
                    )}
                </div>

                {/* Keyboard Hints */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Kısayollar: <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs mx-1">1</kbd> Zor
                        <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs mx-1">2</kbd> İyi
                        <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs mx-1">3</kbd> Kolay
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function FlashcardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        }>
            <FlashcardContent />
        </Suspense>
    );
}
