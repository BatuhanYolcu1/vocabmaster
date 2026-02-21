'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
}

interface Question {
    word: Word;
    sentenceWithBlank: string;
    options: string[];
    correctIndex: number;
}

function FillBlankContent() {
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
    const [showHint, setShowHint] = useState(false);

    const xpProcessed = useRef(false);

    useEffect(() => {
        if (!listId) {
            router.push('/study/select');
            return;
        }

        async function fetchWords() {
            try {
                const res = await fetch(`/api/words?listId=${listId}&limit=15`);
                if (res.ok) {
                    const allWords: Word[] = await res.json();

                    // Filter words that have example sentences
                    const wordsDb = allWords.filter(w => w.exampleSentence && w.exampleSentence.length > 5);

                    if (wordsDb.length >= 4) {
                        const generatedQuestions = generateQuestions(wordsDb);
                        setQuestions(generatedQuestions.slice(0, 10)); // Take 10 max
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, [listId, router]);

    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 20; // Slightly more XP for this mode
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpEarned, source: 'fill-blank' })
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

    function createBlankSentence(sentence: string, word: string): string {
        // Try exact match first (case insensitive)
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(sentence)) {
            return sentence.replace(regex, '_________');
        }

        // If exact word is not found (might be plural/conjugated), try finding it as substring
        const subRegex = new RegExp(word, 'gi');
        if (subRegex.test(sentence)) {
            return sentence.replace(subRegex, '_________');
        }

        // Fallback if the word is surprisingly not in its own example sentence
        return sentence + " (Boşluk: _________)";
    }

    function generateQuestions(words: Word[]): Question[] {
        // We need words that have at least 3 other words as distractors
        return words.map((word, index) => {
            const otherWords = words.filter((_, i) => i !== index);
            const shuffledOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
            const wrongAnswers = shuffledOthers.map(w => w.word);

            const correctIndex = Math.floor(Math.random() * 4);
            const options: string[] = [];
            let wrongIndex = 0;

            for (let i = 0; i < 4; i++) {
                if (i === correctIndex) {
                    options.push(word.word);
                } else {
                    options.push(wrongAnswers[wrongIndex++] || '???');
                }
            }

            return {
                word,
                sentenceWithBlank: createBlankSentence(word.exampleSentence, word.word),
                options,
                correctIndex
            };
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
            setShowHint(false);
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
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">warning</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Yeterli Kelime Bulunamadı</h2>
                    <p className="text-[#92a4c9] mb-8">
                        Bu modda çalışmak için listende örnek cümle içeren en az 4 kelime olmalıdır.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/categories" className="px-6 py-3 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all">
                            Kelime Ekle
                        </Link>
                        <Link href="/study/select" className="px-6 py-3 glass-button text-white rounded-xl font-medium">
                            Geri Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score.correct / questions.length) * 100);
        const xpEarned = score.correct * 20;

        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4 relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/15 blur-[100px]" />
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-8">
                        <span className="material-symbols-outlined text-white text-5xl">emoji_events</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Çalışma Tamamlandı! 🎉</h1>
                    <p className="text-[#92a4c9] text-lg mb-8">Cümle tamamlama pratiğini bitirdin.</p>

                    <div className="glass-panel rounded-3xl p-8 mb-8">
                        <div className="grid grid-cols-3 gap-8 mb-8">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-emerald-400">{score.correct}</p>
                                <p className="text-sm text-[#92a4c9]">Doğru</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-rose-400">{score.wrong}</p>
                                <p className="text-sm text-[#92a4c9]">Yanlış</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-indigo-400">%{percentage}</p>
                                <p className="text-sm text-[#92a4c9]">Başarı</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center justify-center gap-2 text-amber-400 text-xl font-bold">
                                <span className="material-symbols-outlined">star</span>
                                +{xpEarned} XP Kazandın!
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link href="/study/select" className="px-6 py-3 glass-button text-white rounded-xl font-medium">Mod Seç</Link>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all">
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
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/study/select" className="flex items-center gap-2 text-[#92a4c9] hover:text-white transition-colors group">
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Çıkış</span>
                    </Link>
                    <div className="glass-panel px-4 py-2 rounded-full text-sm text-white font-medium">
                        Soru {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="glass-panel rounded-3xl p-8 md:p-12 mb-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-semibold transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                        İpucu
                    </button>

                    <p className="text-[#92a4c9] text-sm md:text-base mb-6 font-medium uppercase tracking-wider">Aşağıdaki cümleyi tamamla</p>

                    <h2 className="text-2xl md:text-4xl font-black text-white leading-relaxed tracking-tight py-4">
                        {currentQuestion.sentenceWithBlank}
                    </h2>

                    {/* Hint section */}
                    {showHint && (
                        <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-in fade-in zoom-in-95">
                            <p className="text-amber-200 text-sm font-medium mb-1">Cümlenin Türkçe Anlamı:</p>
                            <p className="text-white/80 italic">&quot;{currentQuestion.word.exampleSentenceTr}&quot;</p>
                            <div className="mt-3 pt-3 border-t border-amber-500/10">
                                <p className="text-amber-200 text-sm font-medium mb-1">Aranan Kelime Anlamı:</p>
                                <p className="text-white font-bold">{currentQuestion.word.turkishTranslation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = 'glass-card hover:border-indigo-500/50 hover:bg-indigo-500/10';

                        if (selectedAnswer !== null) {
                            if (index === currentQuestion.correctIndex) {
                                buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                            } else if (index === selectedAnswer && !isCorrect) {
                                buttonStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                            } else {
                                buttonStyle = 'bg-white/5 border-white/5 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={selectedAnswer !== null}
                                className={`w-full p-6 rounded-2xl font-bold text-center transition-all border text-lg shadow-lg ${buttonStyle}`}
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-[#92a4c9] text-sm font-bold opacity-70">
                                        {index + 1}
                                    </span>
                                    <span className="text-white tracking-wide">{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Feedback & Next Button */}
                {selectedAnswer !== null && (
                    <div className="text-center animate-in slide-in-from-bottom-4 fade-in duration-300">
                        {isCorrect ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-6 text-xl bg-emerald-500/10 py-3 rounded-2xl border border-emerald-500/20">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                                Mükemmel! +20 XP
                            </div>
                        ) : (
                            <div className="mb-6 bg-rose-500/10 py-4 px-6 rounded-2xl border border-rose-500/20">
                                <div className="flex items-center justify-center gap-2 text-rose-400 font-bold mb-2 text-lg">
                                    <span className="material-symbols-outlined text-2xl">cancel</span>
                                    Yanlış Seçim
                                </div>
                                <div className="text-white">
                                    <span className="text-[#92a4c9] text-sm">Cümlenin doğrusu:</span>
                                    <p className="font-bold text-emerald-400 mt-1">&quot;{currentQuestion.word.exampleSentence}&quot;</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all"
                        >
                            {currentIndex < questions.length - 1 ? 'Sıradaki Cümle' : 'Sonuçları Gör'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                )}

                <p className="text-center text-sm text-slate-500 mt-8">
                    Kısayol: <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs mx-1">1-4</kbd> seç,
                    <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs ml-2">Enter</kbd> devam
                </p>
            </div>
        </div>
    );
}

export default function FillBlankPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#92a4c9]">Yükleniyor...</p>
                </div>
            </div>
        }>
            <FillBlankContent />
        </Suspense>
    );
}
