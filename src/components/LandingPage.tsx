'use client';

import Link from 'next/link';
import { useState } from 'react';

const floatingWords = [
    { word: 'resilient', tr: 'dayanıklı', color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/20' },
    { word: 'eloquent', tr: 'etkili konuşan', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20' },
    { word: 'ambition', tr: 'hırs', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
    { word: 'perseverance', tr: 'azim', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
    { word: 'innovation', tr: 'yenilik', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
    { word: 'pragmatic', tr: 'gerçekçi', color: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/20' },
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="bg-[#0b0f17] min-h-screen -mt-24 -mb-12 text-white overflow-hidden">

            {/* ═══ HERO ═══ */}
            <section className="relative pt-40 pb-20 px-4">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#135bec]/12 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute top-20 right-[15%] w-[350px] h-[350px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#135bec]/30 bg-[#135bec]/10 text-[#7da8ff] text-sm font-medium mb-8">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        AI Destekli Kelime Öğrenme Platformu
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                        Dil öğrenmenin{' '}
                        <span className="bg-gradient-to-r from-[#135bec] via-purple-500 to-[#135bec] bg-clip-text text-transparent">
                            en akıllı yolu
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#8b9bb4] text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
                        Ezberlemeyi bırak, öğrenmeye başla. Akıllı tekrar sistemi, 7 interaktif çalışma modu ve yapay zeka desteğiyle kelimeler kalıcı olarak aklında kalsın.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/register"
                            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(19,91,236,0.4)] hover:shadow-[0_0_50px_rgba(19,91,236,0.6)] hover:scale-105 transition-all flex items-center gap-2"
                        >
                            Ücretsiz Başla
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-4 rounded-full border border-white/15 bg-white/5 text-white font-medium text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            Nasıl Çalışır?
                            <span className="material-symbols-outlined text-base">expand_more</span>
                        </a>
                    </div>

                    {/* Floating Word Cards — Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                        {floatingWords.map((w, i) => (
                            <div
                                key={i}
                                className={`bg-gradient-to-br ${w.color} backdrop-blur-sm border ${w.border} rounded-xl px-4 py-3 hover:scale-105 transition-all cursor-default`}
                                style={{
                                    animation: `float 4s ease-in-out infinite`,
                                    animationDelay: `${i * 0.4}s`,
                                }}
                            >
                                <p className="text-white font-bold text-sm">{w.word}</p>
                                <p className="text-white/50 text-xs">{w.tr}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="py-24 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] font-semibold text-sm uppercase tracking-wider">Özellikler</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-4">Dil öğrenmenin yeni yolu</h2>
                        <p className="text-[#8b9bb4] text-lg max-w-2xl mx-auto">Sıkıcı kelime listelerini unutun. VocabMaster ile öğrenme süreciniz tamamen değişecek.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: 'psychology', title: 'Akıllı Öğrenme', desc: 'SM-2 algoritması ile kelimeleri tam zamanında tekrar ederek kalıcı hafızaya aktarın.', gradient: 'from-[#135bec] to-blue-600' },
                            { icon: 'bolt', title: 'Akıllı Tekrar (SRS)', desc: 'Unutmaya başladığınız kelimeleri tam zamanında hatırlatan spaced repetition sistemi.', gradient: 'from-amber-500 to-orange-500' },
                            { icon: 'emoji_events', title: 'Oyunlaştırma', desc: 'XP kazanın, seviye atlayın, rozetler toplayın ve liderlik tablosunda yarışın.', gradient: 'from-emerald-500 to-green-600' },
                            { icon: 'language', title: '7 Çalışma Modu', desc: 'Flashcard, Quiz, Yazma, Dinleme, Eşleştirme, Konuşma ve Cümle Tamamlama.', gradient: 'from-cyan-500 to-blue-500' },
                            { icon: 'auto_awesome', title: 'AI Destekli İçerik', desc: 'Gemini AI ile her kelime için örnek cümleler, telaffuz ve hafıza teknikleri üretilir.', gradient: 'from-rose-500 to-pink-600' },
                            { icon: 'explore', title: 'Kelime Kütüphanesi', desc: 'Yüzlerce hazır kelimeyi keşfet, filtreyle ve tek tıkla listene ekle.', gradient: 'from-indigo-500 to-violet-600' },
                        ].map((f) => (
                            <div key={f.title} className="group bg-[#111827]/60 border border-white/5 rounded-2xl p-6 hover:border-white/15 hover:bg-[#1a2332]/60 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-white text-[22px]">{f.icon}</span>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                                <p className="text-[#8b9bb4] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-16 px-4 border-y border-white/5 bg-[#111827]/40">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '12,500+', label: 'Aktif Kullanıcı' },
                        { value: '850K+', label: 'Öğrenilen Kelime' },
                        { value: '%97', label: 'Memnuniyet', highlight: true },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className={`text-3xl md:text-4xl font-extrabold ${s.highlight ? 'text-[#135bec]' : 'text-white'}`}>{s.value}</p>
                            <p className="text-[#8b9bb4] text-sm mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ PRICING ═══ */}
            <section id="pricing" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] font-semibold text-sm uppercase tracking-wider">Fiyatlandırma</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-4">Sana uygun planı seç</h2>
                        <p className="text-[#8b9bb4] text-lg">Ücretsiz başla, ihtiyacına göre yükselt.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Ücretsiz', price: '₺0', period: 'sonsuza dek', popular: false, gradient: '', features: ['Günde 10 kelime', '3 kelime listesi', '3 çalışma modu', 'Temel istatistikler', '5 AI üretim/gün'], cta: 'Hemen Başla', ctaStyle: 'bg-white/10 hover:bg-white/15 text-white' },
                            { name: 'Lite', price: '₺29.99', period: '/ay', popular: true, gradient: 'from-[#135bec] to-blue-600', features: ['Günde 50 kelime', '10 kelime listesi', '5 çalışma modu', 'Detaylı istatistikler', '30 AI üretim/gün', 'Excel içe aktarma', 'Reklamsız'], cta: "Lite'a Geç", ctaStyle: 'bg-gradient-to-r from-[#135bec] to-blue-600 text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' },
                            { name: 'Pro', price: '₺59.99', period: '/ay', popular: false, gradient: 'from-purple-500 to-fuchsia-600', features: ['Sınırsız kelime', 'Sınırsız liste', 'Tüm 7 mod', 'Tam istatistikler', 'Sınırsız AI', 'Story modu', 'Öncelikli destek', 'Reklamsız'], cta: "Pro'ya Geç", ctaStyle: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
                        ].map((plan) => (
                            <div key={plan.name} className={`relative bg-[#111827]/80 rounded-2xl p-7 border flex flex-col ${plan.popular ? 'border-[#135bec]/50 shadow-[0_0_40px_rgba(19,91,236,0.15)] scale-105' : 'border-white/10'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white text-xs font-bold">En Popüler</div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-[#8b9bb4] text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2.5 text-sm text-[#c0cfe0]">
                                            <span className="material-symbols-outlined text-emerald-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`w-full py-3.5 rounded-full font-bold text-center block transition-all hover:scale-[1.02] ${plan.ctaStyle}`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-24 px-4 border-t border-white/5 bg-[#111827]/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] font-semibold text-sm uppercase tracking-wider">Kullanıcılar</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">Onlar ne diyor?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Elif K.', role: 'Üniversite Öğrencisi', text: 'YDS hazırlığımda VocabMaster sayesinde 3 ayda 2000+ kelime öğrendim. Akıllı tekrar sistemi gerçekten işe yarıyor!' },
                            { name: 'Ahmet Y.', role: 'Yazılım Mühendisi', text: 'Teknik İngilizce kelimelerimi güçlendirmek için harika. AI ile üretilen örnek cümleler çok kaliteli.' },
                            { name: 'Zeynep D.', role: 'Lise Öğretmeni', text: 'Öğrencilerime kelime listesi hazırlamak artık çok kolay. Sınıfça yarışıyoruz!' },
                        ].map((t) => (
                            <div key={t.name} className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {[1,2,3,4,5].map((s) => (
                                        <span key={s} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                </div>
                                <p className="text-[#c0cfe0] text-sm leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{t.name}</p>
                                        <p className="text-[#8b9bb4] text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] font-semibold text-sm uppercase tracking-wider">SSS</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">Sıkça Sorulan Sorular</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { q: 'VocabMaster nasıl çalışır?', a: 'Kelime listeleri oluşturursun, AI yardımıyla açıklamalar üretilir ve akıllı tekrar sistemi (SRS) ile en verimli zamanlarda pratik yaparsın.' },
                            { q: 'Ücretsiz plan yeterli mi?', a: 'Ücretsiz plan günde 10 kelime ve 3 çalışma moduyla temel ihtiyaçları karşılar. Daha yoğun çalışma için Lite veya Pro planlarına geçebilirsin.' },
                            { q: 'Hangi dilleri destekliyorsunuz?', a: 'Şu anda İngilizce-Türkçe destekleniyor. İleride Almanca, Fransızca ve İspanyolca da eklenecek.' },
                            { q: 'Mobilde kullanabilir miyim?', a: 'Evet! VocabMaster PWA desteklidir, telefonunuza uygulama olarak ekleyebilirsiniz.' },
                        ].map((faq, i) => (
                            <button
                                key={i}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full text-left bg-[#111827]/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between p-5">
                                    <span className="text-white font-semibold pr-4">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-[#135bec] transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                                {openFaq === i && (
                                    <p className="px-5 pb-5 text-[#8b9bb4] text-sm leading-relaxed animate-fadeIn">{faq.a}</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-20 px-4 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Öğrenmeye hazır mısın?</h2>
                    <p className="text-[#8b9bb4] text-lg mb-8">Hemen ücretsiz başla, kelime hazineni güçlendir.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(19,91,236,0.5)] hover:shadow-[0_0_50px_rgba(19,91,236,0.7)] hover:scale-105 transition-all"
                    >
                        Ücretsiz Başla
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-white/5 py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                    <span className="material-symbols-outlined text-white text-[18px]">school</span>
                                </div>
                                <span className="text-white font-bold">VocabMaster</span>
                            </div>
                            <p className="text-[#8b9bb4] text-sm">AI destekli kelime öğrenme platformu.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <a href="#pricing" className="block hover:text-white transition-colors">Fiyatlandırma</a>
                                <Link href="/register" className="block hover:text-white transition-colors">Ücretsiz Başla</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Destek</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <Link href="/about" className="block hover:text-white transition-colors">Hakkımızda</Link>
                                <Link href="/contact" className="block hover:text-white transition-colors">İletişim</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Yasal</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <Link href="/privacy" className="block hover:text-white transition-colors">Gizlilik Politikası</Link>
                                <Link href="/terms" className="block hover:text-white transition-colors">Kullanım Koşulları</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-6">
                        <p className="text-[#8b9bb4] text-sm text-center">
                            © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </div>
    );
}
