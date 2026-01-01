'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Clock, Trophy, RotateCcw } from 'lucide-react';

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

export default function MatchingGamePage() {
    const { update } = useSession();
    const [words, setWords] = useState<Word[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    const xpProcessed = useRef(false);

    // Fetch and setup game
    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=6');
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
    }, []);

    // Setup game cards
    function setupGame(wordList: Word[]) {
        const gameCards: Card[] = [];

        wordList.forEach(word => {
            // English word card
            gameCards.push({
                id: `word-${word.id}`,
                text: word.word,
                type: 'word',
                wordId: word.id,
                isMatched: false,
                isSelected: false,
            });
            // Turkish translation card
            gameCards.push({
                id: `trans-${word.id}`,
                text: word.turkishTranslation,
                type: 'translation',
                wordId: word.id,
                isMatched: false,
                isSelected: false,
            });
        });

        // Shuffle cards
        const shuffled = gameCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setStartTime(new Date());
        setMatchedPairs(0);
        setMoves(0);
        setEndTime(null);
        setSelectedCard(null);
        xpProcessed.current = false; // Reset for new game
    }

    const isGameComplete = matchedPairs === words.length && words.length > 0;

    // XP Submission
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

    // Handle card click
    const handleCardClick = useCallback((card: Card) => {
        if (card.isMatched || card.isSelected) return;

        // Select the card
        setCards(prev => prev.map(c =>
            c.id === card.id ? { ...c, isSelected: true } : c
        ));

        if (!selectedCard) {
            // First card selected
            setSelectedCard(card);
        } else {
            // Second card selected - check for match
            setMoves(prev => prev + 1);

            if (selectedCard.wordId === card.wordId && selectedCard.type !== card.type) {
                // Match!
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
                // No match - flip back
                setTimeout(() => {
                    setCards(prev => prev.map(c => ({ ...c, isSelected: false })));
                    setSelectedCard(null);
                }, 800);
            }
        }
    }, [selectedCard, words.length]);

    // Calculate time
    const getElapsedTime = () => {
        if (!startTime) return '0:00';
        const end = endTime || new Date();
        const seconds = Math.floor((end.getTime() - startTime.getTime()) / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Reset game
    const resetGame = () => {
        setupGame(words);
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const xpEarned = matchedPairs * 25; // 2.5x multiplier

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/study/modes"
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Çıkış</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{getElapsedTime()}</span>
                    </div>
                    <div className="text-gray-600">
                        Hamle: <span className="font-semibold">{moves}</span>
                    </div>
                    <button
                        onClick={resetGame}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Yeniden başla"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Eşleşme</span>
                    <span>{matchedPairs} / {words.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${(matchedPairs / words.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Game Complete */}
            {isGameComplete && (
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white text-center mb-6 shadow-xl">
                    <Trophy className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tebrikler! 🎉</h2>
                    <p className="text-pink-100 mb-4">
                        {getElapsedTime()} sürede {moves} hamle ile tamamladın!
                    </p>
                    <p className="text-xl font-semibold">+{xpEarned} XP Kazandın! ⭐</p>
                    <div className="flex gap-4 justify-center mt-6">
                        <Link
                            href="/study/modes"
                            className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
                        >
                            Mod Seç
                        </Link>
                        <button
                            onClick={resetGame}
                            className="px-6 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
                        >
                            Tekrar Oyna
                        </button>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        disabled={card.isMatched || isGameComplete}
                        className={`aspect-[3/4] rounded-xl p-3 text-center font-medium transition-all duration-300 ${card.isMatched
                            ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700 scale-95 opacity-70'
                            : card.isSelected
                                ? 'bg-pink-100 border-2 border-pink-500 text-pink-700 scale-105 shadow-lg'
                                : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-pink-300 hover:shadow-md'
                            }`}
                    >
                        <div className="h-full flex items-center justify-center">
                            <span className={`text-sm sm:text-base ${card.type === 'word' ? 'font-semibold' : ''}`}>
                                {card.text}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <p className="text-center text-sm text-gray-400 mt-8">
                İngilizce kelimeleri Türkçe anlamlarıyla eşleştir
            </p>
        </div>
    );
}
