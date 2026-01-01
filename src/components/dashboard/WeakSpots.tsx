'use client';

import Link from 'next/link';
import { ArrowRight, AlertCircle, BookOpen } from 'lucide-react';

export default function WeakSpots() {
    // For now, show a helpful empty state since we don't have proper weak spots tracking yet
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900">Zayıf Noktalar</h3>
                </div>
                <Link
                    href="/categories"
                    className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                    Listeler <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-gray-600 mb-2">Henüz yeterli veri yok</p>
                <p className="text-sm text-gray-400">
                    Quiz çözdükçe zorlandığın kelimeler burada görünecek
                </p>
            </div>

            <Link
                href="/study/modes"
                className="block w-full text-center py-3 mt-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
            >
                Çalışmaya Başla
            </Link>
        </div>
    );
}
