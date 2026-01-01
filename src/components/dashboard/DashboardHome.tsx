'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Play,
    Map,
    Target,
    ArrowRight,
    BookOpen
} from 'lucide-react';

import StatsWidget from '@/components/StatsWidget';
import LearningChart from '@/components/dashboard/LearningChart';
import WeakSpots from '@/components/dashboard/WeakSpots';

export default function DashboardHome() {
    const { data: session } = useSession();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {session ? `Merhaba, ${session.user?.name} 👋` : 'Hoş Geldin!'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Bugün öğrenmek için harika bir gün. Hedeflerine ulaşmaya hazır mısın?
                    </p>
                </div>

                <Link
                    href="/study/modes"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 group"
                >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Hemen Çalış</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <StatsWidget />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <LearningChart />

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/categories" className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform">
                            <BookOpen className="w-8 h-8 mb-4 text-emerald-100" />
                            <h3 className="text-xl font-bold mb-1">Kelimelerim</h3>
                            <p className="text-emerald-100 text-sm">Listelerini yönet ve yeni kelimeler ekle</p>
                        </Link>

                        <Link href="/achievements" className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform">
                            <Target className="w-8 h-8 mb-4 text-amber-100" />
                            <h3 className="text-xl font-bold mb-1">Başarımlar</h3>
                            <p className="text-amber-100 text-sm">Rozetlerini gör ve yeni hedefler belirle</p>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <WeakSpots />

                    {/* Daily Tip */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            💡 Günün İpucu
                        </h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            Beynimiz uyurken öğrendiklerimizi işler. Uyumadan önce 10 dakika kelime tekrarı yapmak, kalıcılığı %40 artırır!
                        </p>
                    </div>

                    <Link
                        href="/leaderboard"
                        className="block bg-white rounded-3xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Liderlik Tablosu</h3>
                            <Map className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-500">Arkadaşlarınla yarış ve sıralamada yüksel!</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
