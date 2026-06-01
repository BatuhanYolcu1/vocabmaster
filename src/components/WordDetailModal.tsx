'use client';

import { AlertCircle, Clock, GraduationCap, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WordDetail {
    id: string;
    word: string;
    turkishTranslation: string;
    definitionTr: string;
    exampleSentence: string;
    exampleSentenceTr: string;
    type: string;
    level: string;
    category: string;
    lists: { id: string; name: string }[];
    progress: {
        reviewCount: number;
        correctCount: number;
        wrongCount: number;
        accuracy: number;
        mastery: string;
        lastRating: string | null;
        nextReview: string;
        lastStudied: string;
    } | null;
}

interface WordDetailModalProps {
    wordId: string | null;
    onClose: () => void;
}

export default function WordDetailModal({ wordId, onClose }: WordDetailModalProps) {
    const [word, setWord] = useState<WordDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wordId) return;
        setLoading(true);
        fetch(`/api/words/${wordId}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setWord(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [wordId]);

    if (!wordId) return null;

    const masteryColor = word?.progress?.mastery === 'Ustalaşmış' ? 'text-emerald-400' :
        word?.progress?.mastery === 'İlerliyor' ? 'text-blue-400' :
            word?.progress?.mastery === 'Öğreniliyor' ? 'text-amber-400' : 'text-gray-400';

    const masteryBg = word?.progress?.mastery === 'Ustalaşmış' ? 'bg-emerald-500/20 border-emerald-500/30' :
        word?.progress?.mastery === 'İlerliyor' ? 'bg-blue-500/20 border-blue-500/30' :
            word?.progress?.mastery === 'Öğreniliyor' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-gray-500/20 border-gray-500/30';

    const typeMap: Record<string, string> = {
        noun: 'İsim', verb: 'Fiil', adjective: 'Sıfat', adverb: 'Zarf',
        preposition: 'Edat', conjunction: 'Bağlaç', pronoun: 'Zamir'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw size={40} className="text-[#135bec] animate-spin" />
                        <p className="text-[#8b9bb4] mt-3 text-sm">Yükleniyor...</p>
                    </div>
                ) : word ? (
                    <>
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-[#135bec] to-blue-700 px-6 py-5">
                            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                                    {word.level}
                                </span>
                                <span className="text-xs text-white/70">{typeMap[word.type] || word.type}</span>
                            </div>
                            <h2 className="text-3xl font-black text-white">{word.word}</h2>
                            <p className="text-lg text-blue-100 mt-1 font-medium">{word.turkishTranslation}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            {/* Definition */}
                            <div>
                                <p className="text-xs text-[#8b9bb4] uppercase tracking-wider mb-1.5 font-semibold">Tanım</p>
                                <p className="text-white/90 text-sm leading-relaxed">{word.definitionTr}</p>
                            </div>

                            {/* Example */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-xs text-[#8b9bb4] uppercase tracking-wider mb-2 font-semibold">Örnek Cümle</p>
                                <p className="text-white/90 text-sm italic">&quot;{word.exampleSentence}&quot;</p>
                                <p className="text-[#8b9bb4] text-xs mt-1.5">{word.exampleSentenceTr}</p>
                            </div>

                            {/* Lists */}
                            {word.lists.length > 0 && (
                                <div>
                                    <p className="text-xs text-[#8b9bb4] uppercase tracking-wider mb-2 font-semibold">Listeler</p>
                                    <div className="flex flex-wrap gap-2">
                                        {word.lists.map(list => (
                                            <span key={list.id} className="text-xs bg-[#135bec]/10 text-[#135bec] px-3 py-1.5 rounded-full border border-[#135bec]/20 font-medium">
                                                {list.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Progress */}
                            {word.progress ? (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-[#8b9bb4] uppercase tracking-wider font-semibold">İlerleme</p>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${masteryBg} ${masteryColor}`}>
                                            {word.progress.mastery}
                                        </span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-white">{word.progress.reviewCount}</p>
                                            <p className="text-[10px] text-[#8b9bb4]">Tekrar</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-emerald-400">{word.progress.correctCount}</p>
                                            <p className="text-[10px] text-[#8b9bb4]">Doğru</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-red-400">{word.progress.wrongCount}</p>
                                            <p className="text-[10px] text-[#8b9bb4]">Yanlış</p>
                                        </div>
                                    </div>

                                    {/* Accuracy Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[#8b9bb4]">Doğruluk Oranı</span>
                                            <span className={`font-bold ${word.progress.accuracy >= 80 ? 'text-emerald-400' : word.progress.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                %{word.progress.accuracy}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${word.progress.accuracy >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : word.progress.accuracy >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                                                style={{ width: `${word.progress.accuracy}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Next Review */}
                                    <div className="flex items-center gap-2 text-xs text-[#8b9bb4]">
                                        <Clock size={18} />
                                        Sonraki tekrar: {new Date(word.progress.nextReview).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <GraduationCap size={24} className="text-[#8b9bb4] mb-1" />
                                    <p className="text-[#8b9bb4] text-sm">Henüz çalışılmadı</p>
                                    <p className="text-[#8b9bb4]/60 text-xs mt-1">Bu kelimeyi pratik yaparak ilerlemeye başla!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <AlertCircle size={40} className="text-red-400 mb-2" />
                        <p className="text-[#8b9bb4] text-sm">Kelime bulunamadı</p>
                    </div>
                )}
            </div>
        </div>
    );
}
