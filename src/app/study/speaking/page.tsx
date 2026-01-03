'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, Check, X, Loader2 } from 'lucide-react';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    exampleSentence?: string;
}

// Declare SpeechRecognition types
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item: (index: number) => SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

export default function SpeakingPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const currentWord = words[currentIndex];

    // Check browser support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
            }
        }
    }, []);

    // Fetch words
    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    // Shuffle
                    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10);
                    setWords(shuffled);
                }
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        fetchWords();
    }, []);

    const speakWord = useCallback(() => {
        if (!currentWord) return;
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }, [currentWord]);

    const calculateSimilarity = (spoken: string, target: string): number => {
        const s1 = spoken.toLowerCase().trim();
        const s2 = target.toLowerCase().trim();

        if (s1 === s2) return 100;

        // Simple Levenshtein-based similarity
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 100;

        // Check if the target word is contained in the spoken text
        if (s1.includes(s2) || s2.includes(s1)) {
            return 85;
        }

        // Check first few characters
        const minLen = Math.min(s1.length, s2.length);
        let matchCount = 0;
        for (let i = 0; i < minLen; i++) {
            if (s1[i] === s2[i]) matchCount++;
        }

        return Math.round((matchCount / longer.length) * 100);
    };

    const startListening = useCallback(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);

            if (event.results[last].isFinal && currentWord) {
                const similarity = calculateSimilarity(text, currentWord.word);

                if (similarity >= 70) {
                    setResult('correct');
                    setScore(prev => prev + 1);
                } else {
                    setResult('incorrect');
                }
                setAttempts(prev => prev + 1);
                setIsListening(false);
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        setTranscript('');
        setResult(null);
    }, [isSupported, currentWord]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const nextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTranscript('');
            setResult(null);
        }
    };

    const retry = () => {
        setTranscript('');
        setResult(null);
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 mx-auto animate-spin" />
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-8 text-center border border-amber-200 dark:border-amber-800">
                    <MicOff className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Tarayıcı Desteklenmiyor
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Konuşma tanıma özelliği bu tarayıcıda çalışmıyor. Lütfen Chrome veya Edge kullanın.
                    </p>
                    <Link
                        href="/study/modes"
                        className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Diğer Modlara Dön
                    </Link>
                </div>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Çalışılacak kelime bulunamadı</p>
                    <Link
                        href="/categories"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Kelime listesi oluştur
                    </Link>
                </div>
            </div>
        );
    }

    const isComplete = currentIndex >= words.length - 1 && result !== null;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/study/modes"
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Mic className="w-7 h-7 text-rose-500" />
                            Konuşma Koçu
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">Telaffuzunu geliştir</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Skor</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{score}/{attempts}</p>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>İlerleme</span>
                    <span>{currentIndex + 1} / {words.length}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    />
                </div>
            </div>

            {isComplete ? (
                /* Completion Card */
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border border-rose-200 dark:border-rose-800">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tebrikler!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {score} / {attempts} kelimeyi doğru telaffuz ettin
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/study/modes"
                            className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Bitir
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            ) : (
                /* Word Card */
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                    {/* Word Display */}
                    <div className="text-center mb-8">
                        <button
                            onClick={speakWord}
                            className="mb-4 p-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                            <Volume2 className="w-8 h-8" />
                        </button>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {currentWord?.word}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {currentWord?.turkishTranslation}
                        </p>
                    </div>

                    {/* Listening State */}
                    <div className="flex flex-col items-center gap-4">
                        {result === null ? (
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`p-8 rounded-full transition-all ${isListening
                                        ? 'bg-rose-500 text-white animate-pulse scale-110'
                                        : 'bg-rose-100 dark:bg-rose-900/50 text-rose-500 hover:bg-rose-200 dark:hover:bg-rose-800'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                            </button>
                        ) : result === 'correct' ? (
                            <div className="p-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500">
                                <Check className="w-12 h-12" />
                            </div>
                        ) : (
                            <div className="p-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-500">
                                <X className="w-12 h-12" />
                            </div>
                        )}

                        <p className="text-gray-600 dark:text-gray-400">
                            {isListening ? 'Dinleniyor...' : result === null ? 'Mikrofona bas ve söyle' : ''}
                        </p>

                        {transcript && (
                            <div className="w-full p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duyduğum:</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{transcript}</p>
                            </div>
                        )}

                        {result !== null && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={retry}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Tekrar
                                </button>
                                <button
                                    onClick={nextWord}
                                    className="px-8 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                                >
                                    Sonraki →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
