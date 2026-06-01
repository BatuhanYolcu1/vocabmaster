'use client';

import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, Star, Trophy, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    definitionTr: string;
}

interface Question {
    word: Word;
    options: string[];
    correctIndex: number;
}

function MultipleChoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listId = searchParams.get('listId');
    const { data: session, update } = useSession();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

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
                    const words: Word[] = await res.json();
                    if (words.length >= 4) {
                        const generatedQuestions = generateQuestions(words);
                        setQuestions(generatedQuestions);
                    }
                }
            } catch {
                // Use fallback or empty
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, [listId, router]);

    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 15;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'multiple-choice' })
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

    function generateQuestions(words: Word[]): Question[] {
        return words.map((word, index) => {
            const otherWords = words.filter((_, i) => i !== index);
            const shuffled = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
            const wrongAnswers = shuffled.map(w => w.turkishTranslation);

            const correctIndex = Math.floor(Math.random() * 4);
            const options: string[] = [];
            let wrongIndex = 0;

            for (let i = 0; i < 4; i++) {
                if (i === correctIndex) {
                    options.push(word.turkishTranslation);
                } else {
                    options.push(wrongAnswers[wrongIndex++] || '???');
                }
            }

            return { word, options, correctIndex };
        });
    }

    const handleAnswer = useCallback((optionIndex: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(optionIndex);
        const correct = optionIndex === questions[currentIndex].correctIndex;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }
    }, [selectedAnswer, questions, currentIndex]);

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setShowResult(true);
        }
    }, [currentIndex, questions.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedAnswer === null) {
                if (e.key >= '1' && e.key <= '4') {
                    handleAnswer(parseInt(e.key) - 1);
                }
            } else {
                if (e.key === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    handleNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, handleAnswer, handleNext]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                        <HelpCircle size={40} className="text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Yeterli Kelime Bulunamadı</h2>
                    <p className="text-[#92a4c9] mb-8">
                        Bu modda çalışmak için en az 4 kelimeye ihtiyacınız var.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/wordlists/new"
                            className="px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                        >
                            Kelime Ekle
                        </Link>
                        <Link
                            href="/study/select"
                            className="px-6 py-3 glass-button text-white rounded-xl font-medium"
                        >
                            Geri Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score.correct / questions.length) * 100);
        const xpEarned = score.correct * 15;

        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4 relative">
                {/* Ambient Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_40px_rgba(34,197,94,0.4)] mb-8">
                        <Trophy size={48} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Quiz Tamamlandı! 🎉</h1>
                    <p className="text-[#92a4c9] text-lg mb-8">Harika iş çıkardın!</p>

                    <div className="glass-panel rounded-3xl p-8 mb-8">
                        <div className="grid grid-cols-3 gap-8 mb-8">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-green-400">{score.correct}</p>
                                <p className="text-sm text-[#92a4c9]">Doğru</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-red-400">{score.wrong}</p>
                                <p className="text-sm text-[#92a4c9]">Yanlış</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#135bec]">%{percentage}</p>
                                <p className="text-sm text-[#92a4c9]">Başarı</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center justify-center gap-2 text-amber-400 text-xl font-bold">
                                <Star size={20} />
                                +{xpEarned} XP Kazandın!
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/study/select"
                            className="px-6 py-3 glass-button text-white rounded-xl font-medium"
                        >
                            Mod Seç
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all"
                        >
                            Tekrar Oyna
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/study/select"
                        className="flex items-center gap-2 text-[#92a4c9] hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Çıkış</span>
                    </Link>
                    <div className="glass-panel px-4 py-2 rounded-full text-sm text-white font-medium">
                        Soru {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="glass-panel rounded-3xl p-8 mb-6 text-center">
                    <p className="text-[#92a4c9] text-sm mb-4">Bu kelimenin Türkçe anlamı nedir?</p>
                    <h2 className="text-5xl font-black text-white tracking-tight">
                        {currentQuestion.word.word}
                    </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3 mb-8">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = 'glass-card hover:border-[#135bec]/50 hover:bg-white/5';

                        if (selectedAnswer !== null) {
                            if (index === currentQuestion.correctIndex) {
                                buttonStyle = 'bg-green-500/20 border-green-500 text-green-300';
                            } else if (index === selectedAnswer && !isCorrect) {
                                buttonStyle = 'bg-red-500/20 border-red-500 text-red-300';
                            } else {
                                buttonStyle = 'bg-white/5 border-white/5 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={selectedAnswer !== null}
                                className={`w-full p-5 rounded-2xl font-medium text-left transition-all border ${buttonStyle}`}
                            >
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-[#92a4c9] mr-4 text-sm font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-white">{option}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Feedback & Next Button */}
                {selectedAnswer !== null && (
                    <div className="text-center">
                        {isCorrect ? (
                            <div className="flex items-center justify-center gap-2 text-green-400 font-semibold mb-4">
                                <CheckCircle size={20} />
                                Doğru! +15 XP
                            </div>
                        ) : (
                            <div className="text-red-400 font-semibold mb-4">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle size={20} />
                                    Yanlış!
                                </div>
                                <p className="text-sm text-[#92a4c9]">Doğru cevap: {currentQuestion.options[currentQuestion.correctIndex]}</p>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                        >
                            {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Keyboard hint */}
                <p className="text-center text-sm text-slate-500 mt-8">
                    Kısayol: <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs mx-1">1-4</kbd> seç,
                    <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs ml-2">Enter</kbd> devam
                </p>
            </div>
        </div>
    );
}

export default function MultipleChoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        }>
            <MultipleChoiceContent />
        </Suspense>
    );
}
