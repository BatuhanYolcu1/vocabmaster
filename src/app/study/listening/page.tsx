'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Volume2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
}

export default function ListeningQuizPage() {
    const { update } = useSession();
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);

    const xpProcessed = useRef(false);

    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    setWords(data);
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, []);

    // Generate options when word changes
    useEffect(() => {
        if (words.length > 0 && currentIndex < words.length) {
            const currentWord = words[currentIndex];
            const otherWords = words.filter((_, i) => i !== currentIndex);
            const wrongOptions = otherWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.word);

            const allOptions = [...wrongOptions, currentWord.word];
            setOptions(allOptions.sort(() => Math.random() - 0.5));
            setHasPlayed(false);
        }
    }, [words, currentIndex]);

    // XP submission
    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 20;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'listening' })
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
    }, [showResult, score.correct, update]);

    // Speak word
    const speakWord = useCallback(() => {
        if ('speechSynthesis' in window && words[currentIndex]) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(words[currentIndex].word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
            setHasPlayed(true);
        }
    }, [words, currentIndex]);

    // Auto-play on load
    useEffect(() => {
        if (!loading && words.length > 0 && !hasPlayed) {
            const timer = setTimeout(speakWord, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, words, currentIndex, hasPlayed, speakWord]);

    // Handle answer
    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(index);
        const correct = options[index] === words[currentIndex].word;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }
    };

    // Next question
    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setShowResult(true);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score.correct / words.length) * 100);
        const xpEarned = score.correct * 20; // 2x multiplier

        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dinleme Testi Bitti! 🎧</h1>
                    <p className="text-gray-600 mb-8">Harika kulak!</p>

                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-emerald-600">{score.correct}</p>
                                <p className="text-sm text-gray-500">Doğru</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-500">{score.wrong}</p>
                                <p className="text-sm text-gray-500">Yanlış</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-indigo-600">%{percentage}</p>
                                <p className="text-sm text-gray-500">Başarı</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                            <p className="text-amber-600 font-semibold text-lg">+{xpEarned} XP Kazandın! ⭐</p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/study/modes"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Mod Seç
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
                        >
                            Tekrar Oyna
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    if (!currentWord) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
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
                    Soru {currentIndex + 1} / {words.length}
                </div>
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-xl text-white text-center mb-8">
                <p className="text-cyan-100 text-sm mb-6">Dinle ve doğru kelimeyi seç</p>

                <button
                    onClick={speakWord}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 hover:bg-white/30 transition-colors mb-4"
                >
                    <Volume2 className="w-12 h-12" />
                </button>

                <p className="text-cyan-100 text-sm">Dinlemek için tıkla</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                {options.map((option, index) => {
                    let buttonStyle = 'bg-white border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50';

                    if (selectedAnswer !== null) {
                        if (option === currentWord.word) {
                            buttonStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700';
                        } else if (index === selectedAnswer && !isCorrect) {
                            buttonStyle = 'bg-red-50 border-2 border-red-500 text-red-700';
                        } else {
                            buttonStyle = 'bg-gray-50 border-2 border-gray-200 opacity-50';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={`p-4 rounded-xl font-medium text-center transition-all ${buttonStyle}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {/* Feedback & Next */}
            {selectedAnswer !== null && (
                <div className="text-center">
                    {isCorrect ? (
                        <p className="text-emerald-600 font-semibold mb-4 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Doğru! +20 XP
                        </p>
                    ) : (
                        <p className="text-red-500 font-semibold mb-4 flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Yanlış! Doğru cevap: {currentWord.word}
                        </p>
                    )}

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        {currentIndex < words.length - 1 ? 'Sonraki' : 'Sonuçlar'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
