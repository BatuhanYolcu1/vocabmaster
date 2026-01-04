'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    Layers,
    CheckSquare,
    PenLine,
    Link2,
    Headphones,
    Play,
    Star,
    Mic,
    Zap,
    ArrowRight,
    Sparkles,
    Trophy,
    Target
} from 'lucide-react';

interface QuizMode {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    shadowColor: string;
    xpMultiplier: number;
    difficulty: string;
    difficultyColor: string;
    href: string;
}

const quizModes: QuizMode[] = [
    {
        id: 'flashcard',
        name: 'Flashcard',
        description: 'Klasik çevirmeli kart modu. Kelimeyi gör, anlamını hatırla.',
        icon: <Layers className="w-7 h-7" />,
        gradient: 'from-indigo-500 to-violet-600',
        shadowColor: 'shadow-indigo-500/30',
        xpMultiplier: 1,
        difficulty: 'Kolay',
        difficultyColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        href: '/study/flashcard',
    },
    {
        id: 'multiple-choice',
        name: 'Çoktan Seçmeli',
        description: '4 seçenek arasından doğru anlamı bul.',
        icon: <CheckSquare className="w-7 h-7" />,
        gradient: 'from-emerald-500 to-teal-600',
        shadowColor: 'shadow-emerald-500/30',
        xpMultiplier: 1.5,
        difficulty: 'Orta',
        difficultyColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        href: '/study/multiple-choice',
    },
    {
        id: 'typing',
        name: 'Yazarak Cevapla',
        description: 'Türkçe anlamı görüp İngilizce kelimeyi yaz.',
        icon: <PenLine className="w-7 h-7" />,
        gradient: 'from-amber-500 to-orange-600',
        shadowColor: 'shadow-amber-500/30',
        xpMultiplier: 2,
        difficulty: 'Zor',
        difficultyColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        href: '/study/typing',
    },
    {
        id: 'matching',
        name: 'Eşleştirme',
        description: 'Kelimeleri anlamlarıyla eşleştir. Hız önemli!',
        icon: <Link2 className="w-7 h-7" />,
        gradient: 'from-pink-500 to-rose-600',
        shadowColor: 'shadow-pink-500/30',
        xpMultiplier: 2.5,
        difficulty: 'Orta',
        difficultyColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        href: '/study/matching',
    },
    {
        id: 'listening',
        name: 'Dinleme',
        description: 'Kelimeyi dinle ve doğru yazılışını seç.',
        icon: <Headphones className="w-7 h-7" />,
        gradient: 'from-cyan-500 to-blue-600',
        shadowColor: 'shadow-cyan-500/30',
        xpMultiplier: 2,
        difficulty: 'Zor',
        difficultyColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        href: '/study/listening',
    },
    {
        id: 'speaking',
        name: 'Konuşma Koçu',
        description: 'Mikrofon ile telaffuzunu test et ve geliştir.',
        icon: <Mic className="w-7 h-7" />,
        gradient: 'from-rose-500 to-pink-600',
        shadowColor: 'shadow-rose-500/30',
        xpMultiplier: 2.5,
        difficulty: '🎙️ Yeni',
        difficultyColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        href: '/study/speaking',
    },
];

export default function StudyModesPage() {
    const { } = useSession();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-violet-500/25">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
                    <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-400/20 rounded-full blur-xl" />

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <span className="text-violet-200 text-sm font-medium">Çalışma Merkezi</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold">
                                    Çalışma Modu Seç 🎯
                                </h1>
                                <p className="text-violet-100 text-lg max-w-xl">
                                    Farklı modlarla kelime bilgini test et ve XP kazan
                                </p>
                            </div>

                            <Link
                                href="/study/flashcard"
                                className="group flex items-center gap-3 px-8 py-4 bg-white text-violet-600 rounded-2xl font-bold text-lg hover:bg-violet-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
                            >
                                <Zap className="w-6 h-6" />
                                <span>Hızlı Başla</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                                    <Target className="w-5 h-5 text-violet-200" />
                                    6
                                </div>
                                <p className="text-violet-200 text-sm">Çalışma Modu</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                                    <Star className="w-5 h-5 text-yellow-300" />
                                    2.5x
                                </div>
                                <p className="text-violet-200 text-sm">Max XP Çarpanı</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                                    <Trophy className="w-5 h-5 text-amber-300" />
                                    ∞
                                </div>
                                <p className="text-violet-200 text-sm">Sınırsız Quiz</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz Modes Grid */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                            <Play className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tüm Modlar</h2>
                    </div>

                    <div className="grid gap-4">
                        {quizModes.map((mode) => (
                            <Link
                                key={mode.id}
                                href={mode.href}
                                className="group relative overflow-hidden bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                                <div className="relative flex items-center gap-6">
                                    {/* Icon */}
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.gradient} text-white shadow-lg ${mode.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                        {mode.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{mode.name}</h3>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${mode.difficultyColor}`}>
                                                {mode.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{mode.description}</p>
                                    </div>

                                    {/* XP Multiplier */}
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-400 rounded-xl font-bold border border-amber-200 dark:border-amber-800/50">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span>{mode.xpMultiplier}x XP</span>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Tips Section */}
                <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-violet-500/25 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">💡</span>
                            <h3 className="text-xl font-bold">Pro İpuçları</h3>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-2xl mb-2">📈</div>
                                <p className="text-violet-100 text-sm">Kolay modlardan başlayıp zor modlara geç</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-2xl mb-2">⭐</div>
                                <p className="text-violet-100 text-sm">Zor modlar daha fazla XP kazandırır!</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-2xl mb-2">⌨️</div>
                                <p className="text-violet-100 text-sm">Klavye kısayolları ile daha hızlı çalış</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
