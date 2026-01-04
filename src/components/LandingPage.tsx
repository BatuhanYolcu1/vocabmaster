'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Zap, Trophy, Globe } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen -mt-24 pt-24 -mb-12 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
                        <svg
                            className="absolute inset-y-0 right-0 hidden h-full w-48 translate-x-1/2 transform text-slate-50 lg:block"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mx-auto mt-16 max-w-7xl px-4 sm:mt-20 sm:px-6 md:mt-24 lg:mt-28 lg:px-8 xl:mt-32">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Dil öğrenmenin</span>{' '}
                                    <span className="block text-[#135bec] xl:inline">en akıllı yolu</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-600 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                                    VocabMaster ile ezberlemeyi bırak, öğrenmeye başla. Yapay zeka destekli içerik, oyunlaştırılmış testler ve akıllı tekrar sistemi ile kelimeler aklında kalsın.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-full shadow-lg">
                                        <Link
                                            href="/register"
                                            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 px-8 py-3 text-base font-bold text-white hover:shadow-[0_4px_20px_rgba(19,91,236,0.4)] transition-all md:py-4 md:px-10 md:text-lg"
                                        >
                                            Hemen Başla
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            href="/login"
                                            className="flex w-full items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all md:py-4 md:px-10 md:text-lg"
                                        >
                                            Giriş Yap
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    {/* Abstract Decorative Element */}
                    <div className="grid grid-cols-2 gap-4 p-8 opacity-90 transform -rotate-6 scale-90">
                        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100" style={{ animation: 'float 3s ease-in-out infinite' }}>
                            <Brain className="w-12 h-12 text-[#135bec] mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                            <Zap className="w-12 h-12 text-amber-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}>
                            <Trophy className="w-12 h-12 text-emerald-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}>
                            <Globe className="w-12 h-12 text-cyan-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-[#135bec] font-semibold tracking-wide uppercase">Özellikler</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Dil öğrenmenin yeni yolu
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Sıkıcı kelime listelerini unutun. VocabMaster ile öğrenme süreciniz tamamen değişecek.
                        </p>
                    </div>

                    <div className="mt-12">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#135bec] to-blue-600 text-white shadow-lg">
                                        <Brain className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-bold text-gray-900">Yapay Zeka Destekli</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-600">
                                    Google Gemini AI teknolojisi ile kelimeleri sadece çevirmiyoruz; örnek cümleler, açıklamalar ve telaffuz ipuçları üretiyoruz.
                                </dd>
                            </div>

                            <div className="relative bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                                        <Zap className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-bold text-gray-900">Akıllı Tekrar Sistemi</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-600">
                                    Unutmaya başladığınız kelimeleri tam zamanında hatırlatan SRS algoritması ile kalıcı öğrenme sağlayın.
                                </dd>
                            </div>

                            <div className="relative bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                                        <Trophy className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-bold text-gray-900">Gamification</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-600">
                                    XP kazanın, seviye atlayın, rozetler toplayın ve liderlik tablosunda arkadaşlarınızla yarışın.
                                </dd>
                            </div>

                            <div className="relative bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-100">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                                        <Globe className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-bold text-gray-900">Çoklu Çalışma Modları</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-600">
                                    Sadece kartlar değil; Çoktan seçmeli, Yazma, Dinleme ve Eşleştirme modları ile her yönden gelişin.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#135bec] to-blue-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">Öğrenmeye hazır mısın?</span>
                        <span className="block text-blue-200">Hemen ücretsiz başla.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-full shadow">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-[#135bec] bg-white hover:bg-gray-50 transition-all md:py-4 md:px-10"
                            >
                                Ücretsiz Başla
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                <span className="material-symbols-outlined text-white text-[18px]">school</span>
                            </div>
                            <span className="text-gray-900 font-bold">VocabMaster</span>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-gray-600 text-sm">
                                Geliştirici: <span className="font-medium text-gray-900">Batuhan YOLCU</span>
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> - Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float animation */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
