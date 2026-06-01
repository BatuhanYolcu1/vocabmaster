'use client';

import { BookOpen, Languages, Quote, Volume2 } from 'lucide-react';
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
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
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
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 flex flex-col items-center justify-center">
                    <div className="text-center">
                        {/* Word Type Badge */}
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#135bec]/20 text-[#60a5fa] border border-[#135bec]/30 mb-6">
                            {getTypeLabel(word.type)}
                        </span>

                        {/* Word */}
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 text-glow">
                            {word.word}
                        </h2>

                        {/* Audio Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                speakWord();
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#135bec]/50 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Volume2 size={20} className="text-[#60a5fa]" />
                            <span className="text-sm font-medium">Dinle</span>
                        </button>
                    </div>

                    {/* Flip Hint */}
                    <p className="absolute bottom-6 text-sm text-[#8b9bb4]">
                        Çevirmek için tıkla veya Space&apos;e bas
                    </p>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 backdrop-blur-xl border border-purple-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.2)] p-6 sm:p-8 flex flex-col justify-center overflow-y-auto">
                    <div className="space-y-5">
                        {/* Turkish Definition */}
                        <div>
                            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <BookOpen size={16} />
                                Tanım
                            </h3>
                            <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                                {word.definitionTr}
                            </p>
                        </div>

                        {/* Example Sentence */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Quote size={16} />
                                Örnek Cümle
                            </h3>
                            <p className="text-sm sm:text-base text-white/80 italic leading-relaxed mb-2">
                                &ldquo;{word.exampleSentence}&rdquo;
                            </p>
                            <p className="text-sm text-[#8b9bb4] leading-relaxed">
                                → {word.exampleSentenceTr}
                            </p>
                        </div>

                        {/* Turkish Translation */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Languages size={16} />
                                Türkçe Karşılığı
                            </h3>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {word.turkishTranslation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
