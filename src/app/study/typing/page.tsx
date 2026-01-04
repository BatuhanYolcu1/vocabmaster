'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
}

export default function TypingQuizPage() {
    const { update } = useSession();
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

    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 20;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'typing' })
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

    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading, currentIndex]);

    const speakHint = () => {
        if ('speechSynthesis' in window && words[currentIndex]) {
            const utterance = new SpeechSynthesisUtterance(words[currentIndex].turkishTranslation);
            utterance.lang = 'tr-TR';
            speechSynthesis.speak(utterance);
        }
    };

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
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">edit_off</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Çalışılacak Kelime Yok</h2>
                    <p className="text-[#8b9bb4] mb-8">Bu modda çalışmak için kelime listenizin dolu olması gerekiyor.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/wordlists/new" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold">
                            Kelime Ekle
                        </Link>
                        <Link href="/study/modes" className="px-6 py-3 glass-button text-white rounded-xl font-medium">
                            Geri Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score.correct / words.length) * 100);
        const xpEarned = score.correct * 20;

        return (
            <div className="min-h-screen bg-[#0b0f17] text-white relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/15 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-8">
                            <span className="material-symbols-outlined text-white text-5xl">edit_note</span>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-3">Yazma Testi Bitti! ✍️</h1>
                        <p className="text-[#8b9bb4] text-lg mb-8">Harika çalışma!</p>

                        <div className="glass-panel rounded-3xl p-8 mb-8">
                            <div className="grid grid-cols-3 gap-8 mb-8">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-green-400">{score.correct}</p>
                                    <p className="text-sm text-[#8b9bb4]">Doğru</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-red-400">{score.wrong}</p>
                                    <p className="text-sm text-[#8b9bb4]">Yanlış</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-[#135bec]">%{percentage}</p>
                                    <p className="text-sm text-[#8b9bb4]">Başarı</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-amber-400 font-bold text-xl flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">star</span>
                                    +{xpEarned} XP Kazandın!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Link href="/study/modes" className="px-6 py-3 glass-button text-white rounded-xl font-semibold">
                                Mod Seç
                            </Link>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                                Tekrar Oyna
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    if (!currentWord) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/study/modes" className="flex items-center gap-2 text-[#8b9bb4] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Çıkış</span>
                    </Link>
                    <div className="text-sm text-[#8b9bb4]">
                        Kelime {currentIndex + 1} / {words.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="glass-panel rounded-2xl p-4 mb-8">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="glass-panel rounded-3xl p-8 mb-6 text-center">
                    <p className="text-[#8b9bb4] text-sm mb-2">Bu Türkçe kelimenin İngilizcesi nedir?</p>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <h2 className="text-3xl font-bold text-white">{currentWord.turkishTranslation}</h2>
                        <button onClick={speakHint} className="p-2 text-[#8b9bb4] hover:text-amber-400 transition-colors">
                            <span className="material-symbols-outlined">volume_up</span>
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
                        className={`w-full max-w-md mx-auto px-6 py-4 text-xl text-center rounded-2xl bg-[#1e293b]/50 border-2 focus:outline-none transition-all ${isChecked
                            ? isCorrect
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-white/10 focus:border-amber-500 text-white placeholder:text-[#8b9bb4]'
                            }`}
                    />

                    {/* Feedback */}
                    {isChecked && (
                        <div className="mt-6">
                            {isCorrect ? (
                                <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Doğru! +20 XP
                                </p>
                            ) : (
                                <div className="text-red-400">
                                    <p className="font-semibold flex items-center justify-center gap-2 mb-2">
                                        <span className="material-symbols-outlined">cancel</span>
                                        Yanlış!
                                    </p>
                                    <p className="text-[#8b9bb4]">
                                        Doğru cevap: <span className="font-bold text-white">{currentWord.word}</span>
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
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-semibold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kontrol Et
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-4 bg-[#135bec] text-white rounded-2xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                        >
                            {currentIndex < words.length - 1 ? 'Sonraki' : 'Sonuçlar'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    )}
                </div>

                {/* Hint */}
                <p className="text-center text-sm text-[#8b9bb4] mt-8">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> ile kontrol et veya devam et
                </p>
            </div>
        </div>
    );
}
