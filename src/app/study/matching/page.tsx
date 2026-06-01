'use client';

import { ArrowLeft, ArrowLeftRight, Check, Clock, Lightbulb, RefreshCw, Star, Trophy } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
}

interface Card {
    id: string;
    text: string;
    type: 'word' | 'translation';
    wordId: string;
    isMatched: boolean;
    isSelected: boolean;
}

function MatchingGameContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listId = searchParams.get('listId');
    const { update } = useSession();
    const [words, setWords] = useState<Word[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [timerDisplay, setTimerDisplay] = useState('0:00');

    const xpProcessed = useRef(false);

    // Fetch and setup game
    useEffect(() => {
        // Redirect if no listId
        if (!listId) {
            router.push('/study/select');
            return;
        }

        async function fetchWords() {
            try {
                const res = await fetch(`/api/words?listId=${listId}&limit=6`);
                if (res.ok) {
                    const data = await res.json();
                    setWords(data);
                    setupGame(data);
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, [listId, router]);

    // Timer update
    useEffect(() => {
        if (!startTime || endTime) return;
        const interval = setInterval(() => {
            const now = new Date();
            const seconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            setTimerDisplay(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, endTime]);

    function setupGame(wordList: Word[]) {
        const gameCards: Card[] = [];
        wordList.forEach(word => {
            gameCards.push({
                id: `word-${word.id}`,
                text: word.word,
                type: 'word',
                wordId: word.id,
                isMatched: false,
                isSelected: false,
            });
            gameCards.push({
                id: `trans-${word.id}`,
                text: word.turkishTranslation,
                type: 'translation',
                wordId: word.id,
                isMatched: false,
                isSelected: false,
            });
        });

        const shuffled = gameCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setStartTime(new Date());
        setMatchedPairs(0);
        setMoves(0);
        setEndTime(null);
        setSelectedCard(null);
        setTimerDisplay('0:00');
        xpProcessed.current = false;
    }

    const isGameComplete = matchedPairs === words.length && words.length > 0;

    useEffect(() => {
        if (isGameComplete && !xpProcessed.current) {
            const xpEarned = matchedPairs * 25;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'matching' })
                })
                    .then(res => {
                        if (res.ok) {
                            update();
                            window.dispatchEvent(new Event('xp-updated'));
                        }
                    })
                    .catch(err => console.error('XP Error:', err));
            }
            xpProcessed.current = true;
        }
    }, [isGameComplete, matchedPairs, update]);

    const handleCardClick = useCallback((card: Card) => {
        if (card.isMatched || card.isSelected) return;

        setCards(prev => prev.map(c =>
            c.id === card.id ? { ...c, isSelected: true } : c
        ));

        if (!selectedCard) {
            setSelectedCard(card);
        } else {
            setMoves(prev => prev + 1);

            if (selectedCard.wordId === card.wordId && selectedCard.type !== card.type) {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.wordId === card.wordId ? { ...c, isMatched: true, isSelected: false } : c
                    ));
                    setMatchedPairs(prev => {
                        const newPairs = prev + 1;
                        if (newPairs === words.length) {
                            setEndTime(new Date());
                        }
                        return newPairs;
                    });
                    setSelectedCard(null);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c => ({ ...c, isSelected: false })));
                    setSelectedCard(null);
                }, 800);
            }
        }
    }, [selectedCard, words.length]);

    const resetGame = () => {
        setupGame(words);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    const xpEarned = matchedPairs * 25;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
                <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] rounded-full bg-rose-500/10 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/study/select"
                        className="flex items-center gap-2 text-[#8b9bb4] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Çıkış</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[#8b9bb4]">
                            <Clock size={20} />
                            <span className="font-mono text-white">{timerDisplay}</span>
                        </div>
                        <div className="text-[#8b9bb4]">
                            Hamle: <span className="font-bold text-white">{moves}</span>
                        </div>
                        <button
                            onClick={resetGame}
                            className="p-2 text-[#8b9bb4] hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-all"
                            title="Yeniden başla"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div className="glass-panel rounded-2xl p-4 mb-8">
                    <div className="flex justify-between text-sm text-[#8b9bb4] mb-3">
                        <span className="flex items-center gap-2">
                            <ArrowLeftRight size={20} className="text-pink-400" />
                            Eşleşme
                        </span>
                        <span className="text-white font-bold">{matchedPairs} / {words.length}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-500 relative"
                            style={{ width: `${(matchedPairs / words.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Game Complete */}
                {isGameComplete && (
                    <div className="relative overflow-hidden rounded-3xl p-8 text-center mb-8">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600 animate-gradient-xy" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Trophy size={40} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3">Tebrikler! 🎉</h2>
                            <p className="text-white/80 mb-4">
                                {timerDisplay} sürede {moves} hamle ile tamamladın!
                            </p>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-xl font-bold mb-6">
                                <Star size={20} className="text-yellow-300" />
                                +{xpEarned} XP
                            </div>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/study/select"
                                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                                >
                                    Mod Seç
                                </Link>
                                <button
                                    onClick={resetGame}
                                    className="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
                                >
                                    Tekrar Oyna
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                    {cards.map((card, index) => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                            disabled={card.isMatched || isGameComplete}
                            className={`group relative aspect-[3/4] rounded-2xl p-3 text-center font-medium transition-all duration-300 overflow-hidden ${card.isMatched
                                ? 'scale-95 opacity-60'
                                : card.isSelected
                                    ? 'scale-105'
                                    : 'hover:scale-102 hover:-translate-y-1'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Card Background */}
                            <div className={`absolute inset-0 transition-all duration-300 ${card.isMatched
                                ? 'bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-2 border-green-400/50'
                                : card.isSelected
                                    ? 'bg-gradient-to-br from-pink-500/40 to-purple-600/40 border-2 border-pink-400/80 shadow-[0_0_30px_rgba(236,72,153,0.5)]'
                                    : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 group-hover:border-pink-400/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                                }`} />

                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            {/* Matched check icon */}
                            {card.isMatched && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check size={16} className="text-white" />
                                </div>
                            )}

                            {/* Card Content */}
                            <div className="relative z-10 h-full flex items-center justify-center">
                                <span className={`text-sm sm:text-base transition-all ${card.isMatched
                                    ? 'text-green-300'
                                    : card.isSelected
                                        ? 'text-white font-bold'
                                        : card.type === 'word'
                                            ? 'text-white font-semibold'
                                            : 'text-pink-200'
                                    }`}>
                                    {card.text}
                                </span>
                            </div>

                            {/* Type indicator */}
                            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider ${card.isMatched ? 'text-green-400/50' : 'text-white/30'
                                }`}>
                                {card.type === 'word' ? 'EN' : 'TR'}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Instructions */}
                <p className="text-center text-sm text-[#8b9bb4] mt-10 flex items-center justify-center gap-2">
                    <Lightbulb size={20} className="text-pink-400" />
                    İngilizce kelimeleri Türkçe anlamlarıyla eşleştir
                </p>
            </div>

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes gradient-xy {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-gradient-xy {
                    background-size: 200% 200%;
                    animation: gradient-xy 4s ease infinite;
                }
            `}</style>
        </div>
    );
}

export default function MatchingGamePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        }>
            <MatchingGameContent />
        </Suspense>
    );
}
