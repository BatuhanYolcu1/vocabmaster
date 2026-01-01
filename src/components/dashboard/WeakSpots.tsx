'use client';

import Link from 'next/link';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface WeakSpot {
    word: string;
    mistakeCount: number;
    lastMistake: string;
}

const mockWeakSpots: WeakSpot[] = [
    { word: 'procrastinate', mistakeCount: 5, lastMistake: '2g önce' },
    { word: 'ambiguous', mistakeCount: 3, lastMistake: '1g önce' },
    { word: 'meticulous', mistakeCount: 3, lastMistake: 'Bugün' },
];

export default function WeakSpots() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-900">Zayıf Noktalar</h3>
                </div>
                <Link
                    href="/categories"
                    className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                    Tümünü Gör <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {mockWeakSpots.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                        <div>
                            <p className="font-semibold text-gray-900">{item.word}</p>
                            <p className="text-xs text-red-600 font-medium">{item.mistakeCount} kez yanlış yapıldı</p>
                        </div>
                        <button className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <Link
                    href="/study/flashcard"
                    className="block w-full text-center py-3 mt-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                    Zayıf Kelimeleri Çalış
                </Link>
            </div>
        </div>
    );
}
