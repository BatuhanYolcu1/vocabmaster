'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import RatingButtons from '@/components/RatingButtons';
import { useStudyStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, Inbox, Plus } from 'lucide-react';

function FlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = searchParams.get('listId');

  const { isSessionActive, cards, currentIndex, isFlipped, startSession, flipCard, rateCard, stats } = useStudyStore();
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!listId) { router.push('/study/select'); return; }
    if (sessionStarted) { setLoading(false); return; }
    fetch(`/api/words?listId=${listId}&limit=20`)
      .then(r => r.ok ? r.json() : [])
      .then(words => {
        if (words.length > 0) { startSession(words); setSessionStarted(true); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionStarted, startSession, listId, router]);

  useEffect(() => {
    if (!isSessionActive && cards.length > 0 && !loading && stats) {
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
      if (e.code === 'Space') { e.preventDefault(); flipCard(); }
      else if (isFlipped) {
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
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-5">
            <Inbox size={24} className="text-[#6b7a94]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Kelime Bulunamadı</h2>
          <p className="text-[#6b7a94] text-sm mb-6">Bu listede henüz kelime yok.</p>
          <Link href="/wordlists/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors">
            <Plus size={15} /> Kelime Ekle
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/study/select" className="flex items-center gap-2 text-[#6b7a94] hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Çıkış
          </Link>
          <span className="text-sm text-[#6b7a94]">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-[#135bec] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-8">
          <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={flipCard} />
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {isFlipped ? (
            <RatingButtons onRate={rateCard} />
          ) : (
            <button
              onClick={flipCard}
              className="w-full max-w-xs py-3.5 bg-[#135bec] text-white rounded-xl font-semibold hover:bg-[#1a6ef5] transition-colors"
            >
              Cevabı Göster
            </button>
          )}
        </div>

        <p className="text-center text-xs text-[#6b7a94] mt-6">
          <kbd className="px-1.5 py-0.5 bg-white/8 rounded text-xs">Space</kbd> çevir &nbsp;
          <kbd className="px-1.5 py-0.5 bg-white/8 rounded text-xs">1</kbd> Zor &nbsp;
          <kbd className="px-1.5 py-0.5 bg-white/8 rounded text-xs">2</kbd> İyi &nbsp;
          <kbd className="px-1.5 py-0.5 bg-white/8 rounded text-xs">3</kbd> Kolay
        </p>
      </div>
    </div>
  );
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin" />
      </div>
    }>
      <FlashcardContent />
    </Suspense>
  );
}
