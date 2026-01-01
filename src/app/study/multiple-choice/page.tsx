'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

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

export default function MultipleChoicePage() {
    const router = useRouter();
    const { data: session, update } = useSession(); // update eklendi

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

    const xpProcessed = useRef(false);

    // Fetch words and create questions
    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=10');
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
    }, []);

    // XP submission
    useEffect(() => {
        if (showResult && !xpProcessed.current) {
            const xpEarned = score.correct * 15;
            if (xpEarned > 0) {
                fetch('/api/xp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: xpEarned,
                        source: 'multiple-choice'
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

    // Generate multiple choice questions
    function generateQuestions(words: Word[]): Question[] {
        return words.map((word, index) => {
            // Get 3 random wrong answers
            const otherWords = words.filter((_, i) => i !== index);
            const shuffled = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
            const wrongAnswers = shuffled.map(w => w.turkishTranslation);

            // Create options array with correct answer at random position
            const correctIndex = Math.floor(Math.random() * 4);
            const options: string[] = [];
            let wrongIndex = 0;

            for (let i = 0; i < 4; i++) {
                if (i === correctIndex) {
                    options.push(word.turkishTranslation);
                } else {
                    options.push(wrongAnswers[wrongIndex++] || '???'); // Fallback if not enough words
                }
            }

            return {
                word,
                options,
                correctIndex,
            };
        });
    }

    // Handle answer selection
    const handleAnswer = useCallback((optionIndex: number) => {
        if (selectedAnswer !== null) return; // Already answered

        setSelectedAnswer(optionIndex);
        const correct = optionIndex === questions[currentIndex].correctIndex;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }
    }, [selectedAnswer, questions, currentIndex]);

    // Handle next question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setShowResult(true);
        }
    }, [currentIndex, questions.length]);

    // Keyboard shortcuts
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
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Yeterli Kelime Bulunamadı</h2>
                    <p className="text-gray-600 mb-6">
                        Bu modda çalışmak için en az 4 kelimeye ihtiyacınız var.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/wordlists/new"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
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
        const percentage = Math.round((score.correct / questions.length) * 100);
        const xpEarned = score.correct * 15;

        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Tamamlandı! 🎉</h1>
                    <p className="text-gray-600 mb-8">Harika iş çıkardın!</p>

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
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
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
                    Soru {currentIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
                <p className="text-center text-gray-500 text-sm mb-4">Bu kelimenin Türkçe anlamı nedir?</p>
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-2">
                    {currentQuestion.word.word}
                </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                    let buttonStyle = 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';

                    if (selectedAnswer !== null) {
                        if (index === currentQuestion.correctIndex) {
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
                            className={`w-full p-4 rounded-xl font-medium text-left transition-all ${buttonStyle}`}
                        >
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 mr-3 text-sm font-bold">
                                {index + 1}
                            </span>
                            {option}
                        </button>
                    );
                })}
            </div>

            {/* Feedback & Next Button */}
            {selectedAnswer !== null && (
                <div className="text-center">
                    {isCorrect ? (
                        <p className="text-emerald-600 font-semibold mb-4 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Doğru! +15 XP
                        </p>
                    ) : (
                        <p className="text-red-500 font-semibold mb-4 flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Yanlış! Doğru cevap: {currentQuestion.options[currentQuestion.correctIndex]}
                        </p>
                    )}

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Keyboard hint */}
            <p className="text-center text-sm text-gray-400 mt-8">
                Kısayol: <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1-4</kbd> seç,
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-2">Enter</kbd> devam
            </p>
        </div>
    );
}
