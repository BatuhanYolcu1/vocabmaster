'use client';

import { Volume2 } from 'lucide-react';
import { SRSCard } from '@/types';

interface FlashcardProps {
    card: SRSCard;
    isFlipped: boolean;
    onFlip: () => void;
}

export default function Flashcard({ card, isFlipped, onFlip }: FlashcardProps) {
    const { word } = card;

    // Translate word types to Turkish
    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'noun': 'isim',
            'verb': 'fiil',
            'adjective': 'sıfat',
            'adverb': 'zarf',
        };
        return types[type] || type;
    };

    // Text-to-Speech function
    const speakWord = () => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(word.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // Slightly slower for learning
            utterance.pitch = 1;

            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            className="perspective-1000 w-full max-w-lg mx-auto cursor-pointer"
            onClick={onFlip}
        >
            <div
                className={`relative w-full h-80 sm:h-96 transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                    }`}
            >
                {/* Front of Card */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-white shadow-xl shadow-indigo-100 border border-gray-100 p-8 flex flex-col items-center justify-center">
                    <div className="text-center">
                        {/* Word Type Badge */}
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mb-4">
                            {getTypeLabel(word.type)}
                        </span>

                        {/* Word */}
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                            {word.word}
                        </h2>

                        {/* Audio Button - Now functional with TTS */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                speakWord();
                            }}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Volume2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Dinle</span>
                        </button>
                    </div>

                    {/* Flip Hint */}
                    <p className="absolute bottom-6 text-sm text-gray-400">
                        Çevirmek için tıkla veya Space&apos;e bas
                    </p>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 shadow-xl shadow-indigo-100 border border-indigo-100 p-8 flex flex-col justify-center overflow-y-auto">
                    <div className="space-y-5">
                        {/* Turkish Definition */}
                        <div>
                            <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                                Tanım
                            </h3>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                {word.definitionTr}
                            </p>
                        </div>

                        {/* Example Sentence */}
                        <div>
                            <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                                Örnek Cümle
                            </h3>
                            <p className="text-base text-gray-700 italic leading-relaxed mb-2">
                                &ldquo;{word.exampleSentence}&rdquo;
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                → {word.exampleSentenceTr}
                            </p>
                        </div>

                        {/* Turkish Translation */}
                        <div className="pt-4 border-t border-indigo-100">
                            <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">
                                Türkçe Karşılığı
                            </h3>
                            <p className="text-xl font-bold text-gray-900">
                                {word.turkishTranslation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
