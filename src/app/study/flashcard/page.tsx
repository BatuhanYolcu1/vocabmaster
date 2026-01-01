'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import RatingButtons from '@/components/RatingButtons';
import ProgressBar from '@/components/ProgressBar';
import { useStudyStore } from '@/lib/store';
import { Rating } from '@/types';
import { ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function FlashcardPage() {
    const router = useRouter();
    const {
        isSessionActive,
        cards,
        currentIndex,
        isFlipped,
        startSession,
        flipCard,
        rateCard,
    } = useStudyStore();
    const [loading, setLoading] = useState(true);

    // Start session on mount
    useEffect(() => {
        async function initSession() {
            if (!isSessionActive) {
                try {
                    const res = await fetch('/api/words?limit=10');
                    if (res.ok) {
                        const words = await res.json();
                        if (words.length > 0) {
                            startSession(words);
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
    }, [isSessionActive, startSession]);

    // Check if session is complete
    useEffect(() => {
        if (!isSessionActive && cards.length > 0 && !loading) {
            router.push('/study/complete');
        }
    }, [isSessionActive, cards.length, loading, router]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flipCard();
            } else if (isFlipped) {
                if (e.key === '1') {
                    rateCard('hard');
                } else if (e.key === '2') {
                    rateCard('good');
                } else if (e.key === '3') {
                    rateCard('easy');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, flipCard, rateCard]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Çalışma oturumu yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Çalışılacak Kelime Yok</h2>
                    <p className="text-gray-600 mb-6">
                        Henüz hiç kelime eklenmemiş veya çalışma hedefine uygun kelime bulunamadı.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/wordlists/new"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Kelime Ekle
                        </Link>
                        <Link
                            href="/categories"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Listelere Git
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    // Safety check just in case
    if (!currentCard) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/study/modes"
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Çıkış</span>
                </Link>
                <div className="text-sm text-gray-500">
                    Çevirmek için <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Space</kbd> tuşuna bas
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <ProgressBar current={currentIndex} total={cards.length} />
            </div>

            {/* Flashcard Area */}
            <div className="relative perspective-1000">
                <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={flipCard} />
            </div>

            {/* Controls */}
            <div className="mt-8 flex justify-center">
                {isFlipped ? (
                    <RatingButtons onRate={rateCard} />
                ) : (
                    <button
                        onClick={flipCard}
                        className="w-full max-w-sm px-6 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Cevabı Göster
                    </button>
                )}
            </div>
        </div>
    );
}
