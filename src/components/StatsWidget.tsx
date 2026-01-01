'use client';

import { useState, useEffect } from 'react';
import { BookCheck, Clock, Target, Flame } from 'lucide-react';

interface DashboardStats {
    wordsToReview: number;
    wordsLearned: number;
    dailyGoal: number;
    streak: number;
}

export default function StatsWidget() {
    const [stats, setStats] = useState<DashboardStats>({
        wordsToReview: 0,
        wordsLearned: 0,
        dailyGoal: 20,
        streak: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        wordsToReview: data.wordsToReview,
                        wordsLearned: data.wordsLearned,
                        dailyGoal: data.dailyGoal,
                        streak: data.streak,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const items = [
        {
            icon: Clock,
            label: 'Tekrar Edilecek',
            value: stats.wordsToReview,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            icon: BookCheck,
            label: 'Öğrenilen',
            value: stats.wordsLearned,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: Target,
            label: 'Günlük Hedef',
            value: stats.dailyGoal,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
        {
            icon: Flame,
            label: 'Gün Serisi',
            value: stats.streak,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-5 h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-3`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500">{item.label}</p>
                </div>
            ))}
        </div>
    );
}
