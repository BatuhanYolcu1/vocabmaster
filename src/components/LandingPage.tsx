'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-[#0b0f17] min-h-screen -mt-24 pt-24 -mb-12 pb-12 text-white relative overflow-hidden">
            {/* Subtle ambient background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-30%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#135bec]/10 blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/8 blur-[120px]" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center py-20 sm:py-28 md:py-36 lg:py-44">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                            <span className="block">İngilizce kelime</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] to-blue-400">öğrenmenin kolay yolu</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-[#92a4c9] max-w-2xl mb-10 leading-relaxed">
                            Akıllı tekrar sistemi, interaktif çalışma modları ve kişiselleştirilmiş öğrenme deneyimi ile kelimeler aklında kalsın.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center rounded-full bg-[#135bec] px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(19,91,236,0.3)] hover:shadow-[0_0_40px_rgba(19,91,236,0.5)] hover:scale-[1.02] transition-all duration-300"
                            >
                                Ücretsiz Başla
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-base font-medium text-[#92a4c9] hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                            >
                                Giriş Yap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="relative z-10 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                icon: 'auto_awesome',
                                title: '6 Çalışma Modu',
                                desc: 'Kartlar, quiz, yazma, eşleştirme, dinleme ve konuşma modları.',
                                color: '#135bec'
                            },
                            {
                                icon: 'psychology',
                                title: 'Akıllı Tekrar',
                                desc: 'SRS algoritması ile unutmaya başladığın kelimeleri tam zamanında tekrarla.',
                                color: '#f59e0b'
                            },
                            {
                                icon: 'emoji_events',
                                title: 'İlerleme Takibi',
                                desc: 'XP kazan, seviye atla ve liderlik tablosunda yerini gör.',
                                color: '#10b981'
                            }
                        ].map((feature) => (
                            <div key={feature.title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${feature.color}15` }}
                                >
                                    <span className="material-symbols-outlined" style={{ color: feature.color }}>{feature.icon}</span>
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-[#8b9bb4] leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="relative z-10 py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Öğrenmeye hazır mısın?</h2>
                    <p className="text-[#92a4c9] mb-8">Hemen ücretsiz hesap oluştur ve farkı hisset.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center px-8 py-4 rounded-full bg-[#135bec] text-white font-bold hover:shadow-[0_0_30px_rgba(19,91,236,0.4)] hover:scale-[1.02] transition-all duration-300"
                    >
                        Hemen Başla
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 mt-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#135bec]">
                                <span className="material-symbols-outlined text-white text-[16px]">school</span>
                            </div>
                            <span className="text-white font-bold text-sm">VocabMaster</span>
                        </div>
                        <p className="text-[#8b9bb4] text-xs">
                            © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
