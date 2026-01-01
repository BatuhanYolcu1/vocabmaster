'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, Volume2 } from 'lucide-react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
}

export default function TypingQuizPage() {
    const { update } = useSession(); // update eklendi
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const xpProcessed = useRef(false);

    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setWords(data);
                    }
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, []);

    // XP submission
    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 20;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: xpEarned,
                        source: 'typing'
                    })
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

    // Focus input on mount and question change
    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading, currentIndex]);

    // Speak the Turkish translation
    const speakHint = () => {
        if ('speechSynthesis' in window && words[currentIndex]) {
            const utterance = new SpeechSynthesisUtterance(words[currentIndex].turkishTranslation);
            utterance.lang = 'tr-TR';
            speechSynthesis.speak(utterance);
        }
    };

    // Check answer
    const checkAnswer = useCallback(() => {
        if (isChecked || !words[currentIndex]) return;

        const correct = userInput.toLowerCase().trim() === words[currentIndex].word.toLowerCase();
        setIsCorrect(correct);
        setIsChecked(true);

        if (correct) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }
    }, [userInput, words, currentIndex, isChecked]);

    // Next question
    const handleNext = useCallback(() => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
            setIsChecked(false);
            setIsCorrect(null);
        } else {
            setShowResult(true);
        }
    }, [currentIndex, words.length]);

    // Keyboard shortcut
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!isChecked) {
                checkAnswer();
            } else {
                handleNext();
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Çalışılacak Kelime Yok</h2>
                    <p className="text-gray-600 mb-6">
                        Bu modda çalışmak için kelime listenizin dolu olması gerekiyor.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/wordlists/new"
                            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                        >
                            Kelime Ekle
                        </Link>
                        <Link
                            href="/study/modes"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Geri Dön
                        </Link>
                    </div>
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Yazma Testi Bitti! ✍️</h1>
                    <p className="text-gray-600 mb-8">Harika çalışma!</p>

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
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
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
                    Kelime {currentIndex + 1} / {words.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Bu Türkçe kelimenin İngilizcesi nedir?</p>
                <div className="flex items-center justify-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {currentWord.turkishTranslation}
                    </h2>
                    <button
                        onClick={speakHint}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Dinle"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isChecked}
                    placeholder="İngilizce kelimeyi yaz..."
                    className={`w-full max-w-md mx-auto px-6 py-4 text-xl text-center border-2 rounded-2xl focus:outline-none transition-colors ${isChecked
                        ? isCorrect
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 focus:border-amber-500'
                        }`}
                />

                {/* Feedback */}
                {isChecked && (
                    <div className="mt-4">
                        {isCorrect ? (
                            <p className="text-emerald-600 font-semibold flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Doğru! +20 XP
                            </p>
                        ) : (
                            <div className="text-red-500">
                                <p className="font-semibold flex items-center justify-center gap-2 mb-2">
                                    <XCircle className="w-5 h-5" />
                                    Yanlış!
                                </p>
                                <p className="text-gray-600">
                                    Doğru cevap: <span className="font-bold text-gray-900">{currentWord.word}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
                {!isChecked ? (
                    <button
                        onClick={checkAnswer}
                        disabled={!userInput.trim()}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Kontrol Et
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        {currentIndex < words.length - 1 ? 'Sonraki' : 'Sonuçlar'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Hint */}
            <p className="text-center text-sm text-gray-400 mt-8">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> ile kontrol et veya devam et
            </p>
        </div>
    );
}
