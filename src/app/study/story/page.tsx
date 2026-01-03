'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles, Loader2, Volume2, RefreshCw } from 'lucide-react';

interface StoryWord {
    word: string;
    translation: string;
    found: boolean;
}

interface StoryData {
    story: string;
    words: StoryWord[];
    level: string;
}

export default function StoryModePage() {
    const [loading, setLoading] = useState(false);
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const [selectedWord, setSelectedWord] = useState<StoryWord | null>(null);
    const [error, setError] = useState('');
    const [level, setLevel] = useState('A2');

    const generateStory = useCallback(async () => {
        setLoading(true);
        setError('');
        setSelectedWord(null);

        try {
            const res = await fetch('/api/ai/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, wordCount: 8 }),
            });

            if (res.ok) {
                const data = await res.json();
                setStoryData(data);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Hikaye oluşturulamadı');
            }
        } catch {
            setError('Sunucu hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    }, [level]);

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        speechSynthesis.speak(utterance);
    };

    const renderStoryWithHighlights = (story: string, words: StoryWord[]) => {
        // Remove ** markers and create interactive elements
        let processedStory = story;
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        // Find all **word** patterns
        const regex = /\*\*([^*]+)\*\*/g;
        let match;

        while ((match = regex.exec(story)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                elements.push(
                    <span key={`text-${lastIndex}`}>
                        {story.slice(lastIndex, match.index)}
                    </span>
                );
            }

            const matchedWord = match[1];
            const wordData = words.find(w =>
                w.word.toLowerCase() === matchedWord.toLowerCase()
            );

            // Add the highlighted word
            elements.push(
                <span
                    key={`word-${match.index}`}
                    onClick={() => wordData && setSelectedWord(wordData)}
                    className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium"
                >
                    {matchedWord}
                </span>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < story.length) {
            elements.push(
                <span key={`text-${lastIndex}`}>
                    {story.slice(lastIndex)}
                </span>
            );
        }

        return elements;
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/study"
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-violet-500" />
                        Hikaye Modu
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelimelerini bağlam içinde öğren</p>
                </div>
            </div>

            {!storyData && !loading && (
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-violet-100 dark:border-violet-800">
                    <Sparkles className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        AI ile Hikaye Oluştur
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Öğrendiğin kelimelerle kişiselleştirilmiş bir hikaye oluştur
                    </p>

                    {/* Level Selection */}
                    <div className="flex justify-center gap-2 mb-6">
                        {['A1', 'A2', 'B1', 'B2'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${level === l
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={generateStory}
                        className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                    >
                        <Sparkles className="w-5 h-5 inline mr-2" />
                        Hikaye Oluştur
                    </button>

                    {error && (
                        <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>
                    )}
                </div>
            )}

            {loading && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-700">
                    <Loader2 className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400">AI hikaye yazıyor...</p>
                </div>
            )}

            {storyData && !loading && (
                <div className="space-y-6">
                    {/* Story Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 text-sm font-medium rounded-full">
                                Seviye {storyData.level}
                            </span>
                            <button
                                onClick={() => speakText(storyData.story.replace(/\*\*/g, ''))}
                                className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                title="Hikayeyi Dinle"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                            {renderStoryWithHighlights(storyData.story, storyData.words)}
                        </div>

                        <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
                            💡 Mor kelimeler üzerine tıklayarak anlamlarını gör
                        </p>
                    </div>

                    {/* Word Translation Popup */}
                    {selectedWord && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-indigo-700 dark:text-indigo-400 text-lg">{selectedWord.word}</p>
                                <p className="text-indigo-600 dark:text-indigo-300">{selectedWord.translation}</p>
                            </div>
                            <button
                                onClick={() => speakText(selectedWord.word)}
                                className="p-3 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Word List */}
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Hikayedeki Kelimeler</h3>
                        <div className="flex flex-wrap gap-2">
                            {storyData.words.map((word, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedWord(word)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedWord?.word === word.word
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {word.word}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Story Button */}
                    <button
                        onClick={generateStory}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Yeni Hikaye Oluştur
                    </button>
                </div>
            )}
        </div>
    );
}
