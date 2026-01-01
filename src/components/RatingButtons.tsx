'use client';

import { Rating } from '@/types';
import { formatInterval } from '@/lib/srs';

interface RatingButtonsProps {
    onRate: (rating: Rating) => void;
    disabled?: boolean;
}

export default function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
    const buttons: { rating: Rating; label: string; emoji: string; color: string }[] = [
        {
            rating: 'hard',
            label: 'Zor',
            emoji: '🔴',
            color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
        },
        {
            rating: 'good',
            label: 'İyi',
            emoji: '🟡',
            color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
        },
        {
            rating: 'easy',
            label: 'Kolay',
            emoji: '🟢',
            color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
        },
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
            {buttons.map((btn) => (
                <button
                    key={btn.rating}
                    onClick={() => onRate(btn.rating)}
                    disabled={disabled}
                    className={`flex-1 flex flex-col items-center gap-1 px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btn.color}`}
                >
                    <span className="text-2xl">{btn.emoji}</span>
                    <span className="font-semibold">{btn.label}</span>
                    <span className="text-xs opacity-70">{formatInterval(btn.rating)}</span>
                </button>
            ))}
        </div>
    );
}

