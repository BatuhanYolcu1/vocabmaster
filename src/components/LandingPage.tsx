'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Zap, Trophy, Globe } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="mx-auto max-w-7xl">
                    <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
                        <svg
                            className="absolute inset-y-0 right-0 hidden h-full w-48 translate-x-1/2 transform text-white lg:block"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Dil öğrenmenin</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">en akıllı yolu</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                                    VocabMaster ile ezberlemeyi bırak, öğrenmeye başla. Yapay zeka destekli içerik, oyunlaştırılmış testler ve akıllı tekrar sistemi ile kelimeler aklında kalsın.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            href="/register"
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                                        >
                                            Hemen Başla
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            href="/login"
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg"
                                        >
                                            Giriş Yap
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-50 flex items-center justify-center">
                    {/* Abstract Decorative Element or Image Placeholder */}
                    <div className="grid grid-cols-2 gap-4 p-8 opacity-80 transform -rotate-6 scale-90">
                        <div className="bg-white p-6 rounded-2xl shadow-xl animate-bounce" style={{ animationDelay: '0s' }}>
                            <Brain className="w-12 h-12 text-indigo-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                            <Zap className="w-12 h-12 text-amber-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl animate-bounce" style={{ animationDelay: '0.4s' }}>
                            <Trophy className="w-12 h-12 text-emerald-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl animate-bounce" style={{ animationDelay: '0.6s' }}>
                            <Globe className="w-12 h-12 text-cyan-500 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Özellikler</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Dil öğrenmenin yeni yolu
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Sıkıcı kelime listelerini unutun. VocabMaster ile öğrenme süreciniz tamamen değişecek.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Brain className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Yapay Zeka Destekli</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Google Gemini AI teknolojisi ile kelimeleri sadece çevirmiyoruz; örnek cümleler, açıklamalar ve telaffuz ipuçları üretiyoruz.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Zap className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Akıllı Tekrar Sistemi</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Unutmaya başladığınız kelimeleri tam zamanında hatırlatan SRS algoritması ile kalıcı öğrenme sağlayın.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Trophy className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Gamification</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    XP kazanın, seviye atlayın, rozetler toplayın ve liderlik tablosunda arkadaşlarınızla yarışın.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Globe className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Çoklu Çalışma Modları</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Sadece kartlar değil; Çoktan seçmeli, Yazma, Dinleme ve Eşleştirme modları ile her yönden gelişin.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
