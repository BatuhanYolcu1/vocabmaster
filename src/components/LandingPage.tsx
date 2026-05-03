'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Animated counter hook
function useCounter(target: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    function animate(now: number) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(target * eased));
                        if (progress < 1) requestAnimationFrame(animate);
                    }
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

// Typing effect hook
function useTypingEffect(words: string[], speed = 100, pause = 2000) {
    const [text, setText] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const word = words[wordIdx];
        const timeout = setTimeout(() => {
            if (!deleting) {
                setText(word.slice(0, charIdx + 1));
                if (charIdx + 1 === word.length) {
                    setTimeout(() => setDeleting(true), pause);
                } else {
                    setCharIdx(charIdx + 1);
                }
            } else {
                setText(word.slice(0, charIdx));
                if (charIdx === 0) {
                    setDeleting(false);
                    setWordIdx((wordIdx + 1) % words.length);
                } else {
                    setCharIdx(charIdx - 1);
                }
            }
        }, deleting ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, wordIdx, words, speed, pause]);

    return text;
}

// FAQ Item
function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <button
            onClick={() => setOpen(!open)}
            className="w-full text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
        >
            <div className="flex justify-between items-center gap-4">
                <span className="font-semibold text-white">{q}</span>
                <span className={`material-symbols-outlined text-[#135bec] transition-transform ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </div>
            {open && <p className="mt-4 text-[#8b9bb4] text-sm leading-relaxed">{a}</p>}
        </button>
    );
}

export default function LandingPage() {
    const typedText = useTypingEffect(['en akıllı yolu', 'en eğlenceli yolu', 'en kalıcı yolu'], 80, 2500);
    const stat1 = useCounter(12500);
    const stat2 = useCounter(850000);
    const stat3 = useCounter(97);

    const features = [
        { icon: 'psychology', title: 'Yapay Zeka Destekli', desc: 'Gemini AI ile kelime açıklamaları, örnek cümleler ve hafıza teknikleri otomatik üretilir.', gradient: 'from-[#135bec] to-blue-600' },
        { icon: 'bolt', title: 'Akıllı Tekrar (SRS)', desc: 'Unutmaya başladığın kelimeleri tam zamanında hatırlatan bilimsel algoritma.', gradient: 'from-amber-500 to-orange-500' },
        { icon: 'emoji_events', title: 'Oyunlaştırma', desc: 'XP kazan, seviye atla, rozetler topla ve liderlik tablosunda yarış.', gradient: 'from-emerald-500 to-green-600' },
        { icon: 'school', title: '7 Çalışma Modu', desc: 'Flashcard, Quiz, Yazma, Dinleme, Konuşma, Eşleştirme ve Cümle Tamamlama.', gradient: 'from-purple-500 to-fuchsia-600' },
        { icon: 'translate', title: 'Türkçe-İngilizce', desc: 'Türk öğrenciler için özel tasarlanmış, ana dilinde açıklamalar ve çeviriler.', gradient: 'from-cyan-500 to-teal-600' },
        { icon: 'bar_chart', title: 'Detaylı İstatistikler', desc: 'Haftalık aktivite, doğruluk oranları ve öğrenme trendlerini takip et.', gradient: 'from-rose-500 to-pink-600' },
    ];

    const testimonials = [
        { name: 'Elif K.', role: 'Üniversite Öğrencisi', text: 'YDS hazırlığımda VocabMaster sayesinde 3 ayda 2000+ kelime öğrendim. Akıllı tekrar sistemi gerçekten işe yarıyor!' },
        { name: 'Ahmet Y.', role: 'Yazılım Mühendisi', text: 'Teknik İngilizce kelimelerimi güçlendirmek için harika. AI ile üretilen örnek cümleler çok kaliteli.' },
        { name: 'Zeynep D.', role: 'Lise Öğretmeni', text: 'Öğrencilerime kelime listesi hazırlamak artık çok kolay. Sınıfça yarışıyoruz!' },
    ];

    const plans = [
        {
            name: 'Ücretsiz', price: '₺0', period: 'sonsuza dek', popular: false,
            features: ['Günde 10 kelime', '3 kelime listesi', '3 çalışma modu', 'Temel istatistikler', '5 AI üretim/gün'],
            cta: 'Hemen Başla', ctaStyle: 'glass-button text-white'
        },
        {
            name: 'Lite', price: '₺29.99', period: '/ay', popular: true,
            features: ['Günde 50 kelime', '10 kelime listesi', '5 çalışma modu', 'Detaylı istatistikler', '30 AI üretim/gün', 'Excel içe aktarma', 'Reklamsız'],
            cta: 'Lite\'a Geç', ctaStyle: 'bg-gradient-to-r from-[#135bec] to-blue-600 text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]'
        },
        {
            name: 'Pro', price: '₺59.99', period: '/ay', popular: false,
            features: ['Sınırsız kelime', 'Sınırsız liste', 'Tüm 7 mod', 'Tam istatistikler', 'Sınırsız AI', 'Story modu', 'Öncelikli destek', 'Reklamsız'],
            cta: 'Pro\'ya Geç', ctaStyle: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
        },
    ];

    const faqs = [
        { q: 'VocabMaster nasıl çalışır?', a: 'Kelime listeleri oluşturursun, AI yardımıyla açıklamalar üretilir ve akıllı tekrar sistemi (SRS) ile en verimli zamanlarda pratik yaparsın. 7 farklı çalışma moduyla kelimeleri kalıcı olarak öğrenirsin.' },
        { q: 'Ücretsiz plan yeterli mi?', a: 'Ücretsiz plan günde 10 kelime ve 3 çalışma moduyla temel öğrenme ihtiyaçlarını karşılar. Daha yoğun çalışma istiyorsan Lite veya Pro planlarına geçebilirsin.' },
        { q: 'Hangi dilleri destekliyorsunuz?', a: 'Şu anda İngilizce-Türkçe dil çifti destekleniyor. İleride Almanca, Fransızca ve İspanyolca gibi diller de eklenecek.' },
        { q: 'Verilerim güvende mi?', a: 'Tüm veriler şifrelenmiş bağlantılarla güvenli sunucularda saklanır. KVKK uyumlu gizlilik politikamız mevcuttur.' },
        { q: 'Mobilde kullanabilir miyim?', a: 'Evet! VocabMaster PWA desteklidir, telefonunuza uygulama olarak ekleyebilirsiniz. Tarayıcıdan da sorunsuz çalışır.' },
    ];

    return (
        <div className="bg-[#0b0f17] min-h-screen -mt-24 pt-24 -mb-12 pb-12 text-white overflow-hidden">
            {/* ═══ HERO ═══ */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                {/* BG Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#135bec]/15 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px]" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 text-[#135bec] text-sm font-medium mb-8">
                        <span className="material-symbols-outlined text-base">auto_awesome</span>
                        AI Destekli Kelime Öğrenme Platformu
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                        Dil öğrenmenin
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] via-blue-400 to-purple-500">
                            {typedText}
                            <span className="animate-pulse text-[#135bec]">|</span>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#8b9bb4] max-w-2xl mx-auto mb-10 leading-relaxed">
                        Ezberlemeyi bırak, öğrenmeye başla. Akıllı tekrar sistemi, 7 interaktif çalışma modu
                        ve yapay zeka desteğiyle kelimeler kalıcı olarak aklında kalsın.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_4px_30px_rgba(19,91,236,0.4)] hover:shadow-[0_4px_40px_rgba(19,91,236,0.6)] hover:scale-105 transition-all"
                        >
                            Ücretsiz Başla
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                        <Link
                            href="#features"
                            className="flex items-center gap-2 px-8 py-4 rounded-full glass-button text-white font-medium text-lg"
                        >
                            Nasıl Çalışır?
                            <span className="material-symbols-outlined text-[#8b9bb4]">expand_more</span>
                        </Link>
                    </div>

                    {/* Floating Word Cards */}
                    <div className="relative max-w-3xl mx-auto h-48 hidden md:block">
                        {[
                            { word: 'resilient', tr: 'dayanıklı', x: '5%', y: '10%', delay: '0s', rotate: '-6deg' },
                            { word: 'eloquent', tr: 'etkili konuşan', x: '70%', y: '5%', delay: '1s', rotate: '4deg' },
                            { word: 'pragmatic', tr: 'pragmatik', x: '25%', y: '55%', delay: '2s', rotate: '3deg' },
                            { word: 'perseverance', tr: 'azim', x: '60%', y: '60%', delay: '0.5s', rotate: '-4deg' },
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="absolute glass-panel rounded-2xl px-5 py-3 hover:scale-110 transition-transform cursor-default"
                                style={{
                                    left: card.x, top: card.y,
                                    transform: `rotate(${card.rotate})`,
                                    animation: `float 4s ease-in-out infinite`,
                                    animationDelay: card.delay,
                                }}
                            >
                                <p className="text-white font-bold text-sm">{card.word}</p>
                                <p className="text-[#8b9bb4] text-xs">{card.tr}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-12 border-y border-white/5">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
                    <div ref={stat1.ref}>
                        <p className="text-3xl md:text-4xl font-black text-white">{stat1.count.toLocaleString()}+</p>
                        <p className="text-[#8b9bb4] text-sm mt-1">Aktif Kullanıcı</p>
                    </div>
                    <div ref={stat2.ref}>
                        <p className="text-3xl md:text-4xl font-black text-white">{stat2.count.toLocaleString()}+</p>
                        <p className="text-[#8b9bb4] text-sm mt-1">Öğrenilen Kelime</p>
                    </div>
                    <div ref={stat3.ref}>
                        <p className="text-3xl md:text-4xl font-black text-white">%{stat3.count}</p>
                        <p className="text-[#8b9bb4] text-sm mt-1">Memnuniyet</p>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="py-20 md:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] text-sm font-bold uppercase tracking-widest">Özellikler</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mt-3 mb-4">Neden VocabMaster?</h2>
                        <p className="text-[#8b9bb4] max-w-xl mx-auto">Bilimsel yöntemler ve modern teknoloji ile tasarlanmış öğrenme deneyimi.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <div key={f.title} className="group glass-panel rounded-2xl p-6 hover:border-white/20 transition-all">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <span className="material-symbols-outlined text-white">{f.icon}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-[#8b9bb4] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRICING ═══ */}
            <section id="pricing" className="py-20 md:py-28 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#135bec]/5 to-transparent pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] text-sm font-bold uppercase tracking-widest">Fiyatlandırma</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mt-3 mb-4">Sana uygun planı seç</h2>
                        <p className="text-[#8b9bb4] max-w-xl mx-auto">Ücretsiz başla, ihtiyacına göre yükselt.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative glass-panel rounded-3xl p-7 flex flex-col ${plan.popular ? 'border-[#135bec]/50 shadow-[0_0_40px_rgba(19,91,236,0.15)] scale-105' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white text-xs font-bold">
                                        En Popüler
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-[#8b9bb4] text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-[#c4d0e4]">
                                            <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`w-full py-3 rounded-xl font-bold text-center block transition-all hover:scale-105 ${plan.ctaStyle}`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] text-sm font-bold uppercase tracking-widest">Kullanıcılar</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mt-3">Onlar ne diyor?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className="material-symbols-outlined text-yellow-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                </div>
                                <p className="text-[#c4d0e4] text-sm leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {t.name[0]}
                                    </div>
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
            <section className="py-20 md:py-28">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#135bec] text-sm font-bold uppercase tracking-widest">SSS</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mt-3">Sıkça Sorulan Sorular</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#135bec]/10 via-purple-600/10 to-[#135bec]/10 pointer-events-none" />
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Öğrenmeye hazır mısın?</h2>
                    <p className="text-[#8b9bb4] text-lg mb-8 max-w-lg mx-auto">Binlerce kullanıcı zaten VocabMaster ile İngilizce kelime haznesini geliştiriyor.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_4px_30px_rgba(19,91,236,0.4)] hover:shadow-[0_4px_40px_rgba(19,91,236,0.6)] hover:scale-105 transition-all"
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
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[18px]">school</span>
                                </div>
                                <span className="text-white font-bold">VocabMaster</span>
                            </div>
                            <p className="text-[#8b9bb4] text-sm">AI destekli kelime öğrenme platformu.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <Link href="#features" className="block hover:text-white transition-colors">Özellikler</Link>
                                <Link href="#pricing" className="block hover:text-white transition-colors">Fiyatlandırma</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Destek</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <Link href="/contact" className="block hover:text-white transition-colors">İletişim</Link>
                                <Link href="/about" className="block hover:text-white transition-colors">Hakkımızda</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Yasal</h4>
                            <div className="space-y-2 text-sm text-[#8b9bb4]">
                                <Link href="/privacy" className="block hover:text-white transition-colors">Gizlilik Politikası</Link>
                                <Link href="/terms" className="block hover:text-white transition-colors">Kullanım Koşulları</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[#8b9bb4] text-xs">
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
