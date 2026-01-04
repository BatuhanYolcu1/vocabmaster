'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Word {
    id: string;
    word: string;
    turkishTranslation: string;
    exampleSentence?: string;
}

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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
            }
        }
    }, []);

    useEffect(() => {
        async function fetchWords() {
            try {
                const res = await fetch('/api/words?limit=10');
                if (res.ok) {
                    const data = await res.json();
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
        if (s1.includes(s2) || s2.includes(s1)) return 85;
        const minLen = Math.min(s1.length, s2.length);
        let matchCount = 0;
        for (let i = 0; i < minLen; i++) {
            if (s1[i] === s2[i]) matchCount++;
        }
        const longer = s1.length > s2.length ? s1 : s2;
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

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

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
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center border-rose-500/20">
                    <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-rose-400">mic_off</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Tarayıcı Desteklenmiyor</h2>
                    <p className="text-[#8b9bb4] mb-8">Konuşma tanıma özelliği bu tarayıcıda çalışmıyor. Lütfen Chrome veya Edge kullanın.</p>
                    <Link href="/study/modes" className="px-6 py-3 bg-[#135bec] text-white rounded-xl font-medium">
                        Diğer Modlara Dön
                    </Link>
                </div>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
                <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                    <p className="text-[#8b9bb4] mb-4">Çalışılacak kelime bulunamadı</p>
                    <Link href="/categories" className="text-[#135bec] hover:underline">Kelime listesi oluştur</Link>
                </div>
            </div>
        );
    }

    const isComplete = currentIndex >= words.length - 1 && result !== null;

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/study/modes" className="p-2 rounded-lg text-[#8b9bb4] hover:text-white hover:bg-white/5 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-rose-500">mic</span>
                                Konuşma Koçu
                            </h1>
                            <p className="text-[#8b9bb4]">Telaffuzunu geliştir</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[#8b9bb4]">Skor</p>
                        <p className="text-2xl font-bold text-rose-400">{score}/{attempts}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="glass-panel rounded-2xl p-4 mb-8">
                    <div className="flex justify-between text-sm text-[#8b9bb4] mb-2">
                        <span>İlerleme</span>
                        <span>{currentIndex + 1} / {words.length}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
                            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        />
                    </div>
                </div>

                {isComplete ? (
                    /* Completion Card */
                    <div className="relative overflow-hidden rounded-3xl p-8 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />

                        <div className="relative z-10">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Tebrikler!</h2>
                            <p className="text-white/80 mb-6">{score} / {attempts} kelimeyi doğru telaffuz ettin</p>
                            <div className="flex justify-center gap-4">
                                <Link href="/study/modes" className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors">
                                    Bitir
                                </Link>
                                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-rose-600 rounded-xl font-bold">
                                    Tekrar Dene
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Word Card */
                    <div className="glass-panel rounded-3xl p-8">
                        {/* Word Display */}
                        <div className="text-center mb-8">
                            <button
                                onClick={speakWord}
                                className="mb-4 p-4 bg-[#135bec]/20 text-[#60a5fa] rounded-full hover:bg-[#135bec]/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">volume_up</span>
                            </button>
                            <h2 className="text-4xl font-bold text-white mb-2">{currentWord?.word}</h2>
                            <p className="text-[#8b9bb4]">{currentWord?.turkishTranslation}</p>
                        </div>

                        {/* Listening State */}
                        <div className="flex flex-col items-center gap-4">
                            {result === null ? (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-8 rounded-full transition-all ${isListening
                                        ? 'bg-rose-500 text-white animate-pulse scale-110 shadow-[0_0_40px_rgba(244,63,94,0.5)]'
                                        : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-5xl">{isListening ? 'mic_off' : 'mic'}</span>
                                </button>
                            ) : result === 'correct' ? (
                                <div className="p-8 rounded-full bg-green-500/20 text-green-400">
                                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                                </div>
                            ) : (
                                <div className="p-8 rounded-full bg-red-500/20 text-red-400">
                                    <span className="material-symbols-outlined text-5xl">cancel</span>
                                </div>
                            )}

                            <p className="text-[#8b9bb4]">
                                {isListening ? 'Dinleniyor...' : result === null ? 'Mikrofona bas ve söyle' : ''}
                            </p>

                            {transcript && (
                                <div className="w-full p-4 bg-white/5 rounded-xl text-center">
                                    <p className="text-sm text-[#8b9bb4] mb-1">Duyduğum:</p>
                                    <p className="text-lg font-medium text-white">{transcript}</p>
                                </div>
                            )}

                            {result !== null && (
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={retry}
                                        className="flex items-center gap-2 px-6 py-3 glass-button text-white rounded-xl font-medium"
                                    >
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Tekrar
                                    </button>
                                    <button
                                        onClick={nextWord}
                                        className="px-8 py-3 bg-rose-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                                    >
                                        Sonraki →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
