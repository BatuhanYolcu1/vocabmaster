'use client';

import { Rating } from '@/types';
import { formatInterval } from '@/lib/srs';
import { ThumbsDown, Minus, ThumbsUp } from 'lucide-react';

interface RatingButtonsProps {
    onRate: (rating: Rating) => void;
    disabled?: boolean;
}

export default function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
    const buttons: { rating: Rating; label: string; icon: React.ReactNode; gradient: string; shadow: string }[] = [
        {
            rating: 'hard',
            label: 'Zor',
            icon: <ThumbsDown className="w-5 h-5" />,
            gradient: 'bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700',
            shadow: 'shadow-lg shadow-rose-200 dark:shadow-rose-900/30',
        },
        {
            rating: 'good',
            label: 'İyi',
            icon: <Minus className="w-5 h-5" />,
            gradient: 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
            shadow: 'shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
        },
        {
            rating: 'easy',
            label: 'Kolay',
            icon: <ThumbsUp className="w-5 h-5" />,
            gradient: 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
            shadow: 'shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30',
        },
    ];

    return (
        <div className="flex gap-4 w-full max-w-md mx-auto">
            {buttons.map((btn) => (
                <button
                    key={btn.rating}
                    onClick={() => onRate(btn.rating)}
                    disabled={disabled}
                    className={`flex-1 flex flex-col items-center gap-2 px-4 py-5 rounded-2xl text-white font-medium transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${btn.gradient} ${btn.shadow}`}
                >
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        {btn.icon}
                    </div>
                    <span className="font-semibold text-sm">{btn.label}</span>
                    <span className="text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                        {formatInterval(btn.rating)}
                    </span>
                </button>
            ))}
        </div>
    );
}
