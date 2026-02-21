'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
                                    VocabMaster ile ezberlemeyi bırak, öğrenmeye başla. Akıllı tekrar sistemi, interaktif çalışma modları ve kişiselleştirilmiş öğrenme deneyimi ile kelimeler aklında kalsın.
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
                    <div className="grid grid-cols-2 gap-4 p-8 opacity-90 transform -rotate-6 scale-90">
                        {[
                            { icon: 'psychology', color: '#135bec', delay: '0s' },
                            { icon: 'bolt', color: '#f59e0b', delay: '0.5s' },
                            { icon: 'emoji_events', color: '#10b981', delay: '1s' },
                            { icon: 'language', color: '#06b6d4', delay: '1.5s' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100"
                                style={{ animation: 'float 3s ease-in-out infinite', animationDelay: item.delay }}
                            >
                                <span className="material-symbols-outlined text-[48px] mb-2" style={{ color: item.color }}>{item.icon}</span>
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-16">
                        <p className="text-base text-[#135bec] font-semibold tracking-wide uppercase">Özellikler</p>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Dil öğrenmenin yeni yolu
                        </p>
                        <p className="mt-4 max-w-2xl text-lg text-gray-500 lg:mx-auto">
                            Sıkıcı kelime listelerini unutun. VocabMaster ile öğrenme süreciniz tamamen değişecek.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: 'psychology',
                                title: 'Akıllı Öğrenme',
                                desc: 'Akıllı tekrar sistemi ile kelimeleri sadece çevirmiyoruz; örnek cümleler, açıklamalar ve telaffuz ipuçları üretiyoruz.',
                                gradient: 'from-[#135bec] to-blue-600'
                            },
                            {
                                icon: 'bolt',
                                title: 'Akıllı Tekrar Sistemi',
                                desc: 'Unutmaya başladığınız kelimeleri tam zamanında hatırlatan SRS algoritması ile kalıcı öğrenme sağlayın.',
                                gradient: 'from-amber-500 to-orange-500'
                            },
                            {
                                icon: 'emoji_events',
                                title: 'Oyunlaştırma',
                                desc: 'XP kazanın, seviye atlayın, rozetler toplayın ve liderlik tablosunda arkadaşlarınızla yarışın.',
                                gradient: 'from-emerald-500 to-green-600'
                            },
                            {
                                icon: 'language',
                                title: 'Çoklu Çalışma Modları',
                                desc: 'Sadece kartlar değil; Çoktan seçmeli, Yazma, Dinleme ve Eşleştirme modları ile her yönden gelişin.',
                                gradient: 'from-cyan-500 to-blue-500'
                            }
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                                        <span className="material-symbols-outlined text-white text-[24px]">{feature.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                                        <p className="text-gray-500 text-[15px] leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
