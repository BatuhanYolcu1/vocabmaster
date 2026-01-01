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
    Star
} from 'lucide-react';

interface QuizMode {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    xpMultiplier: number;
    difficulty: string;
    href: string;
}

const quizModes: QuizMode[] = [
    {
        id: 'flashcard',
        name: 'Flashcard',
        description: 'Klasik çevirmeli kart modu. Kelimeyi gör, anlamını hatırla.',
        icon: <Layers className="w-8 h-8" />,
        color: 'from-indigo-500 to-violet-600',
        xpMultiplier: 1,
        difficulty: 'Kolay',
        href: '/study/flashcard',
    },
    {
        id: 'multiple-choice',
        name: 'Çoktan Seçmeli',
        description: '4 seçenek arasından doğru anlamı bul.',
        icon: <CheckSquare className="w-8 h-8" />,
        color: 'from-emerald-500 to-teal-600',
        xpMultiplier: 1.5,
        difficulty: 'Orta',
        href: '/study/multiple-choice',
    },
    {
        id: 'typing',
        name: 'Yazarak Cevapla',
        description: 'Türkçe anlamı görüp İngilizce kelimeyi yaz.',
        icon: <PenLine className="w-8 h-8" />,
        color: 'from-amber-500 to-orange-600',
        xpMultiplier: 2,
        difficulty: 'Zor',
        href: '/study/typing',
    },
    {
        id: 'matching',
        name: 'Eşleştirme',
        description: 'Kelimeleri anlamlarıyla eşleştir. Hız önemli!',
        icon: <Link2 className="w-8 h-8" />,
        color: 'from-pink-500 to-rose-600',
        xpMultiplier: 2.5,
        difficulty: 'Orta',
        href: '/study/matching',
    },
    {
        id: 'listening',
        name: 'Dinleme',
        description: 'Kelimeyi dinle ve doğru yazılışını seç.',
        icon: <Headphones className="w-8 h-8" />,
        color: 'from-cyan-500 to-blue-600',
        xpMultiplier: 2,
        difficulty: 'Zor',
        href: '/study/listening',
    },
];

export default function StudyModesPage() {
    const { data: session } = useSession();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Çalışma Modu Seç</h1>
                <p className="text-gray-600">Farklı modlarla kelime bilgini test et ve XP kazan</p>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 mb-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">🚀 Hızlı Başla</h2>
                        <p className="text-indigo-100">
                            Rastgele mod ve kelimelerle hızlıca çalışmaya başla
                        </p>
                    </div>
                    <Link
                        href="/study/flashcard"
                        className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        <Play className="w-5 h-5" />
                        Hemen Başla
                    </Link>
                </div>
            </div>

            {/* Quiz Modes Grid */}
            <div className="grid gap-4">
                {quizModes.map((mode) => (
                    <Link
                        key={mode.id}
                        href={mode.href}
                        className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all"
                    >
                        <div className="flex items-center gap-6">
                            {/* Icon */}
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.color} text-white group-hover:scale-110 transition-transform`}>
                                {mode.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{mode.name}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                        {mode.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">{mode.description}</p>
                            </div>

                            {/* XP Multiplier */}
                            <div className="hidden sm:flex items-center gap-1 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium">
                                <Star className="w-4 h-4" />
                                <span>{mode.xpMultiplier}x XP</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Tips */}
            <div className="mt-10 bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">💡 İpuçları</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Kolay modlardan başlayıp zor modlara geç</li>
                    <li>• Her mod farklı XP çarpanı veriyor - zor modlar daha fazla XP!</li>
                    <li>• Klavye kısayolları ile daha hızlı çalış</li>
                </ul>
            </div>
        </div>
    );
}
