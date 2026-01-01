'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Trophy, Flame, Target, Star, BookCheck } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-32 bg-gray-200 rounded-3xl" />
                    <div className="h-48 bg-gray-200 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!session) return null;

    const { user } = session;

    // Calculate level progress (example: 100 XP per level)
    const xpForNextLevel = (user.level || 1) * 100;
    const currentLevelXp = (user.xp || 0) % 100;
    const levelProgress = (currentLevelXp / xpForNextLevel) * 100;

    const getLevelTitle = (level: number) => {
        if (level >= 50) return 'Üstad';
        if (level >= 20) return 'Uzman';
        if (level >= 10) return 'Pratisyen';
        if (level >= 5) return 'Öğrenci';
        return 'Başlangıç';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    {user.image ? (
                        <img
                            src={user.image}
                            alt="Profil"
                            className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                            <User className="w-12 h-12 text-white" />
                        </div>
                    )}

                    {/* Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-bold">{user.name || 'Kullanıcı'}</h1>
                        <p className="text-indigo-100">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                Seviye {user.level || 1} - {getLevelTitle(user.level || 1)}
                            </span>
                            <span className="px-3 py-1 bg-amber-400/30 rounded-full text-sm font-medium flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                {user.streak || 0} Gün Seri
                            </span>
                        </div>
                    </div>

                    {/* XP */}
                    <div className="text-center">
                        <div className="text-4xl font-bold">{user.xp || 0}</div>
                        <div className="text-indigo-100 text-sm">Toplam XP</div>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="mt-6">
                    <div className="flex justify-between text-sm text-indigo-100 mb-2">
                        <span>Seviye {user.level || 1}</span>
                        <span>Seviye {(user.level || 1) + 1}</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                    <p className="text-center text-sm text-indigo-100 mt-2">
                        {xpForNextLevel - currentLevelXp} XP daha ile seviye atla
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="inline-flex p-3 rounded-xl bg-indigo-50 mb-3">
                        <Star className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{user.xp || 0}</p>
                    <p className="text-sm text-gray-500">Toplam XP</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="inline-flex p-3 rounded-xl bg-amber-50 mb-3">
                        <Flame className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{user.streak || 0}</p>
                    <p className="text-sm text-gray-500">Gün Serisi</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="inline-flex p-3 rounded-xl bg-emerald-50 mb-3">
                        <BookCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Öğrenilen</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="inline-flex p-3 rounded-xl bg-violet-50 mb-3">
                        <Trophy className="w-5 h-5 text-violet-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Başarım</p>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Başarımlar
                </h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-center py-8">
                        Henüz kazanılmış başarım yok. Çalışmaya başla ve rozetleri topla! 🏆
                    </p>
                </div>
            </div>
        </div>
    );
}
