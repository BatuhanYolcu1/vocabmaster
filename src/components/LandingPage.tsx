'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Zap, Trophy, Globe, Sparkles, BookOpen } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-[#0b0f17] min-h-screen -mt-24 pt-24 -mb-12 pb-12 text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
                <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] rounded-full bg-cyan-500/10 blur-[80px]" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16 sm:py-20 md:py-24 lg:py-32">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 mb-6">
                                <Sparkles className="w-4 h-4 text-[#135bec]" />
                                <span className="text-sm font-medium text-[#135bec]">Yapay Zeka Destekli Platform</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                                <span className="block">Dil öğrenmenin</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] via-blue-400 to-purple-400">en akıllı yolu</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-[#92a4c9] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                                VocabMaster ile ezberlemeyi bırak, öğrenmeye başla. Yapay zeka destekli içerik, oyunlaştırılmış testler ve akıllı tekrar sistemi ile kelimeler aklında kalsın.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    href="/register"
                                    className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(19,91,236,0.4)] hover:shadow-[0_0_50px_rgba(19,91,236,0.6)] hover:scale-105 transition-all duration-300"
                                >
                                    Hemen Başla
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-full glass-button px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-all"
                                >
                                    Giriş Yap
                                </Link>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                                <div>
                                    <p className="text-2xl font-bold text-white">6+</p>
                                    <p className="text-sm text-[#92a4c9]">Çalışma Modu</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div>
                                    <p className="text-2xl font-bold text-white">AI</p>
                                    <p className="text-sm text-[#92a4c9]">Gemini Destekli</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div>
                                    <p className="text-2xl font-bold text-white">SRS</p>
                                    <p className="text-sm text-[#92a4c9]">Akıllı Tekrar</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="flex-1 relative w-full max-w-lg">
                            <div className="relative w-full aspect-square">
                                {/* Outer glow ring */}
                                <div className="absolute inset-8 rounded-full border-2 border-dashed border-white/10 animate-spin" style={{ animationDuration: '30s' }} />
                                <div className="absolute inset-16 rounded-full border border-[#135bec]/30" />

                                {/* Center logo */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(19,91,236,0.5)]">
                                        <BookOpen className="w-14 h-14 text-white" />
                                    </div>
                                </div>

                                {/* Floating feature cards */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2" style={{ animation: 'landingFloat 3s ease-in-out infinite' }}>
                                    <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#135bec] to-blue-600 flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white whitespace-nowrap">AI ile Öğren</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2" style={{ animation: 'landingFloat 3s ease-in-out infinite', animationDelay: '1.5s' }}>
                                    <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white whitespace-nowrap">XP Kazan</span>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 left-0" style={{ animation: 'landingFloat 3s ease-in-out infinite', animationDelay: '0.75s' }}>
                                    <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white whitespace-nowrap">SRS</span>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-0" style={{ animation: 'landingFloat 3s ease-in-out infinite', animationDelay: '2.25s' }}>
                                    <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white whitespace-nowrap">6 Mod</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="relative z-10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] font-semibold tracking-wide uppercase text-sm">Özellikler</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white">
                            Dil öğrenmenin yeni yolu
                        </h2>
                        <p className="mt-4 max-w-2xl text-lg text-[#92a4c9] mx-auto">
                            Sıkıcı kelime listelerini unutun. VocabMaster ile öğrenme süreciniz tamamen değişecek.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card rounded-3xl p-8 group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#135bec] to-blue-600 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(19,91,236,0.3)] group-hover:scale-110 transition-transform">
                                <Brain className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Yapay Zeka Destekli</h3>
                            <p className="text-[#92a4c9] leading-relaxed">
                                Google Gemini AI teknolojisi ile kelimeleri sadece çevirmiyoruz; örnek cümleler, açıklamalar ve telaffuz ipuçları üretiyoruz.
                            </p>
                        </div>

                        <div className="glass-card rounded-3xl p-8 group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Akıllı Tekrar Sistemi</h3>
                            <p className="text-[#92a4c9] leading-relaxed">
                                Unutmaya başladığınız kelimeleri tam zamanında hatırlatan SRS algoritması ile kalıcı öğrenme sağlayın.
                            </p>
                        </div>

                        <div className="glass-card rounded-3xl p-8 group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Oyunlaştırma</h3>
                            <p className="text-[#92a4c9] leading-relaxed">
                                XP kazanın, seviye atlayın, rozetler toplayın ve liderlik tablosunda arkadaşlarınızla yarışın.
                            </p>
                        </div>

                        <div className="glass-card rounded-3xl p-8 group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
                                <Globe className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Çoklu Çalışma Modları</h3>
                            <p className="text-[#92a4c9] leading-relaxed">
                                Sadece kartlar değil; Çoktan seçmeli, Yazma, Dinleme ve Eşleştirme modları ile her yönden gelişin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-14">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#135bec] to-purple-600" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                        <div className="absolute top-6 left-[20%] w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute bottom-8 right-[30%] w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Öğrenmeye hazır mısın?</h2>
                                <p className="text-blue-100 text-lg">Hemen ücretsiz başla, farkı hisset.</p>
                            </div>
                            <Link
                                href="/register"
                                className="inline-flex items-center px-8 py-4 rounded-full bg-white text-[#135bec] font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 whitespace-nowrap"
                            >
                                Ücretsiz Başla
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                <span className="material-symbols-outlined text-white text-[18px]">school</span>
                            </div>
                            <span className="text-white font-bold">VocabMaster</span>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-[#92a4c9] text-sm">
                                Geliştirici: <span className="font-medium text-white">Batuhan YOLCU</span>
                            </p>
                            <p className="text-[#8b9bb4] text-sm mt-1">
                                © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> - Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float animation for landing cards */}
            <style jsx>{`
                @keyframes landingFloat {
                    0%, 100% { transform: translateY(0px) translateX(0); }
                    50% { transform: translateY(-12px) translateX(0); }
                }
            `}</style>
        </div>
    );
}
