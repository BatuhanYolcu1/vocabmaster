'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
}

function ListeningQuizContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listId = searchParams.get('listId');
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
        // Redirect if no listId
        if (!listId) {
            router.push('/study/select');
            return;
        }

        async function fetchWords() {
            try {
                const res = await fetch(`/api/words?listId=${listId}&limit=10`);
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
    }, [listId, router]);

    useEffect(() => {
        if (words.length > 0 && currentIndex < words.length) {
            const currentWord = words[currentIndex];
            const otherWords = words.filter((_, i) => i !== currentIndex);
            const wrongOptions = otherWords.sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.word);
            const allOptions = [...wrongOptions, currentWord.word];
            setOptions(allOptions.sort(() => Math.random() - 0.5));
            setHasPlayed(false);
        }
    }, [words, currentIndex]);

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

    useEffect(() => {
        if (!loading && words.length > 0 && !hasPlayed) {
            const timer = setTimeout(speakWord, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, words, currentIndex, hasPlayed, speakWord]);

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
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score.correct / words.length) * 100);
        const xpEarned = score.correct * 20;

        return (
            <div className="min-h-screen bg-[#0b0f17] text-white relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_40px_rgba(6,182,212,0.4)] mb-8">
                            <span className="material-symbols-outlined text-white text-5xl">headphones</span>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-3">Dinleme Testi Bitti! 🎧</h1>
                        <p className="text-[#8b9bb4] text-lg mb-8">Harika kulak!</p>

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
                                <p className="text-cyan-400 font-bold text-xl flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">star</span>
                                    +{xpEarned} XP Kazandın!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Link href="/study/select" className="px-6 py-3 glass-button text-white rounded-xl font-semibold">
                                Mod Seç
                            </Link>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)]">
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
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/study/select" className="flex items-center gap-2 text-[#8b9bb4] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Çıkış</span>
                    </Link>
                    <div className="text-sm text-[#8b9bb4]">
                        Soru {currentIndex + 1} / {words.length}
                    </div>
                </div>

                {/* Progress */}
                <div className="glass-panel rounded-2xl p-4 mb-8">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="relative overflow-hidden rounded-3xl p-8 text-white text-center mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />

                    <div className="relative z-10">
                        <p className="text-cyan-100 text-sm mb-6">Dinle ve doğru kelimeyi seç</p>
                        <button
                            onClick={speakWord}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 hover:bg-white/30 hover:scale-105 transition-all mb-4"
                        >
                            <span className="material-symbols-outlined text-5xl">volume_up</span>
                        </button>
                        <p className="text-cyan-100 text-sm">Dinlemek için tıkla</p>
                    </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {options.map((option, index) => {
                        let buttonStyle = 'bg-[#1e293b]/80 border-2 border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-white';

                        if (selectedAnswer !== null) {
                            if (option === currentWord.word) {
                                buttonStyle = 'bg-green-500/20 border-2 border-green-500 text-green-400';
                            } else if (index === selectedAnswer && !isCorrect) {
                                buttonStyle = 'bg-red-500/20 border-2 border-red-500 text-red-400';
                            } else {
                                buttonStyle = 'bg-[#1e293b]/50 border-2 border-white/5 text-[#8b9bb4] opacity-50';
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
                            <p className="text-green-400 font-semibold mb-4 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Doğru! +20 XP
                            </p>
                        ) : (
                            <p className="text-red-400 font-semibold mb-4 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">cancel</span>
                                Yanlış! Doğru cevap: {currentWord.word}
                            </p>
                        )}

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#135bec] text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                        >
                            {currentIndex < words.length - 1 ? 'Sonraki' : 'Sonuçlar'}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ListeningQuizPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        }>
            <ListeningQuizContent />
        </Suspense>
    );
}
