'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const demoWords = [
    { 
        word: 'Resilient', 
        translation: 'Dayanıklı, kendini çabuk toparlayan', 
        ipa: '/rɪˈzɪl.jənt/', 
        sentence: 'She is a resilient student who overcomes exam stress easily.', 
        definition: 'Able to withstand or recover quickly from difficult conditions.' 
    },
    { 
        word: 'Eloquent', 
        translation: 'Etkili konuşan, hitabeti güçlü', 
        ipa: '/ˈel.ə.kwənt/', 
        sentence: 'His pitch was eloquent and convinced all the premium investors.', 
        definition: 'Fluent or persuasive in speaking or writing.' 
    },
    { 
        word: 'Perseverance', 
        translation: 'Azim, kararlılık', 
        ipa: '/ˌpɜː.sɪˈvɪə.rəns/', 
        sentence: 'Through perseverance, she finally achieved fluent English.', 
        definition: 'Persistence in doing something despite difficulty or delay.' 
    }
];

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    velocity: number;
    color: string;
    size: number;
}

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [knownCount, setKnownCount] = useState(0);
    const [studyHistory, setStudyHistory] = useState<string[]>([]);
    const [activeStudyTab, setActiveStudyTab] = useState<'flash' | 'quiz' | 'speak' | 'match'>('flash');

    const currentWord = demoWords[wordIndex];

    const playAudio = (text: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        }
    };

    const triggerConfetti = () => {
        const colors = ['#135bec', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        const newParticles = Array.from({ length: 30 }).map((_, i) => ({
            id: Date.now() + i,
            x: 50,
            y: 50,
            angle: Math.random() * Math.PI * 2,
            velocity: 3 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 4 + Math.random() * 8
        }));
        setParticles(newParticles);

        let frame = 0;
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => {
                const nextX = p.x + Math.cos(p.angle) * p.velocity * 0.7;
                const nextY = p.y + Math.sin(p.angle) * p.velocity * 0.7 + 0.4;
                return {
                    ...p,
                    x: nextX,
                    y: nextY,
                    velocity: p.velocity * 0.94
                };
            }).filter(p => p.y < 120 && p.x > -20 && p.x < 120));

            frame++;
            if (frame > 35) {
                clearInterval(interval);
                setParticles([]);
            }
        }, 25);
    };

    const handleAction = (type: 'known' | 'unknown', e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'known') {
            setKnownCount(prev => prev + 1);
            setStudyHistory(prev => [currentWord.word, ...prev].slice(0, 3));
            triggerConfetti();
        }
        
        setIsFlipped(false);
        setTimeout(() => {
            setWordIndex((prev) => (prev + 1) % demoWords.length);
        }, 200);
    };

    return (
        <div className="bg-slate-50 min-h-screen -mt-24 -mb-12 text-[#0f172a] relative overflow-hidden">
            
            {/* ═══ Aurora Background Blobs ═══ */}
            <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] bg-purple-200/35 rounded-full blur-[140px] pointer-events-none animate-float" />
            <div className="absolute top-[15%] right-[5%] w-[550px] h-[550px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
            <div className="absolute bottom-[20%] left-[10%] w-[650px] h-[650px] bg-emerald-100/35 rounded-full blur-[150px] pointer-events-none animate-float" />
            <div className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] bg-blue-200/35 rounded-full blur-[140px] pointer-events-none animate-float-delayed" />

            {/* ═══ HERO ═══ */}
            <section className="relative pt-44 pb-20 px-4 z-10">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Column: Copy */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-100 bg-white/80 backdrop-blur-md text-[#135bec] text-sm font-semibold mb-8 shadow-sm">
                            <span className="material-symbols-outlined text-base animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            Yapay Zeka Destekli Yeni Nesil Öğrenme
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Kelimeleri ezberleme,{' '}
                            <span className="bg-gradient-to-r from-[#135bec] via-purple-600 to-[#135bec] bg-clip-text text-transparent">
                                yaşayarak öğren.
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-[#475569] text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                            VocabMaster ile ezber süreçleri geride kalıyor. Bilimsel aralıklı tekrar sistemi, zengin çalışma modları ve dinamik telaffuz motoruyla yeni bir dil kazanmak hiç bu kadar doğal olmamıştı.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href="/register"
                                className="px-8 py-4 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_10px_25px_-5px_rgba(19,91,236,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(19,91,236,0.4)] hover:scale-102 transition-all flex items-center justify-center gap-2"
                            >
                                Ücretsiz Başla
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                            <a
                                href="#features"
                                className="px-8 py-4 w-full sm:w-auto rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md text-[#334155] font-semibold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Nasıl Çalışır?
                                <span className="material-symbols-outlined text-base">expand_more</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Live Interactive Demo Widget */}
                    <div className="w-full max-w-md flex flex-col items-center gap-6">
                        <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Canlı Simülatör</span>
                        
                        {/* Flashcard Component wrapper */}
                        <div className="relative w-full aspect-[4/3] max-w-sm perspective-1000 select-none">
                            {/* Particles Overlay */}
                            {particles.map((p) => (
                                <div
                                    key={p.id}
                                    className="absolute rounded-full pointer-events-none z-50 transition-transform duration-300"
                                    style={{
                                        left: `${p.x}%`,
                                        top: `${p.y}%`,
                                        width: `${p.size}px`,
                                        height: `${p.size}px`,
                                        backgroundColor: p.color,
                                        transform: 'translate(-50%, -50%)',
                                        boxShadow: `0 0 10px ${p.color}`
                                    }}
                                />
                            ))}

                            <div 
                                onClick={() => setIsFlipped(!isFlipped)}
                                className={`relative w-full h-full duration-500 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* CARD FRONT */}
                                <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col justify-between shadow-[0_15px_35px_-10px_rgba(15,23,42,0.05)] border border-white/60">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[#135bec] bg-blue-50 px-2.5 py-1 rounded-full">Kelime Kartı</span>
                                        <button 
                                            onClick={(e) => playAudio(currentWord.word, e)}
                                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#475569] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">volume_up</span>
                                        </button>
                                    </div>
                                    <div className="text-center my-auto">
                                        <h3 className="text-3xl font-extrabold text-[#0f172a] mb-1">{currentWord.word}</h3>
                                        <p className="text-slate-400 text-sm font-mono">{currentWord.ipa}</p>
                                    </div>
                                    <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">touch_app</span>
                                        Çevirmek için tıkla
                                    </div>
                                </div>

                                {/* CARD BACK */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white/95 rounded-3xl p-8 flex flex-col justify-between shadow-[0_15px_35px_-10px_rgba(19,91,236,0.08)] border border-indigo-100/70">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">Türkçe Anlamı</span>
                                        <span className="text-xs font-medium text-slate-400">Çift Tıklama/Çevir</span>
                                    </div>
                                    <div className="my-auto">
                                        <h4 className="text-xl font-bold text-[#0f172a] text-center mb-3">{currentWord.translation}</h4>
                                        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                            &ldquo;{currentWord.sentence}&rdquo;
                                        </p>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={(e) => handleAction('unknown', e)}
                                            className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold transition-all flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                                            Bilmiyorum
                                        </button>
                                        <button
                                            onClick={(e) => handleAction('known', e)}
                                            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(19,91,236,0.2)] flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            Biliyorum
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Stats Bar */}
                        <div className="w-full max-w-sm glass-panel rounded-2xl p-4 flex justify-between items-center text-xs shadow-sm border border-white/60">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-slate-500">Öğrenilen:</span>
                                <span className="font-bold text-slate-700">{knownCount} kelime</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {studyHistory.length > 0 ? (
                                    <div className="flex gap-1">
                                        {studyHistory.map((w, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold text-[10px]">{w}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">Denemeye başla!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES (BENTO GRID) ═══ */}
            <section id="features" className="py-28 px-4 border-t border-slate-200/40 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[#135bec] font-bold text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Özellikler</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mt-4 mb-4">Dil öğrenme deneyimini yeniden tasarladık</h2>
                        <p className="text-[#64748b] text-lg max-w-2xl mx-auto">Sıkıcı kelime listelerini unut. İnovatif Bento tasarımımız ile tüm özellikler elinin altında.</p>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Large Card: SRS Memory Decay (Span 2 cols) */}
                        <div className="md:col-span-2 glass-panel rounded-3xl p-8 shadow-sm flex flex-col justify-between border border-white/70 overflow-hidden relative min-h-[300px]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#135bec] flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[24px]">bolt</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Aralıklı Tekrar Sistemi (SRS)</h3>
                                <p className="text-[#64748b] text-sm max-w-md mb-6 leading-relaxed">
                                    SM-2 algoritması, unuttuğun kelimeleri tam unuttuğun saniyede önüne getirerek kelimeleri kalıcı hafızaya kazır.
                                </p>
                            </div>
                            
                            {/* Visual Timeline element representing spaced repetition intervals */}
                            <div className="mt-4 bg-slate-100/50 rounded-2xl p-4 border border-slate-200/30">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mb-2">
                                    <span>Hafıza Seviyesi</span>
                                    <span>Tekrar Aralığı</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-3">
                                    <div className="flex-1 bg-red-100 text-red-700 rounded-lg p-2.5 text-center border border-red-200">
                                        <div className="font-bold text-xs">Aşama 1</div>
                                        <div className="text-[10px] opacity-80">1 Dakika</div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                    <div className="flex-1 bg-amber-100 text-amber-700 rounded-lg p-2.5 text-center border border-amber-200">
                                        <div className="font-bold text-xs">Aşama 2</div>
                                        <div className="text-[10px] opacity-80">12 Saat</div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                    <div className="flex-1 bg-blue-100 text-blue-700 rounded-lg p-2.5 text-center border border-blue-200">
                                        <div className="font-bold text-xs">Aşama 3</div>
                                        <div className="text-[10px] opacity-80">4 Gün</div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                                    <div className="flex-1 bg-emerald-100 text-emerald-700 rounded-lg p-2.5 text-center border border-emerald-200">
                                        <div className="font-bold text-xs">Aşama 4</div>
                                        <div className="text-[10px] opacity-80">16 Gün</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Medium Card: AI Content */}
                        <div className="glass-panel rounded-3xl p-8 shadow-sm flex flex-col justify-between border border-white/70 min-h-[300px]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Yapay Zeka Yardımı</h3>
                                <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                                    Tek tıkla her kelime için hafıza teknikleri, telaffuz tüyoları ve bağlamsal örnek cümleler üret.
                                </p>
                            </div>
                            
                            {/* Stylized Prompt/Result Bubble */}
                            <div className="bg-slate-100/50 border border-slate-200/40 rounded-2xl p-3 text-[11px]">
                                <div className="flex items-center gap-1.5 text-purple-600 font-bold mb-1">
                                    <span className="material-symbols-outlined text-xs">speech_to_text</span>
                                    AI Üretimi Cümle:
                                </div>
                                <p className="text-slate-600 italic">"The resilient flower blossomed despite the frost."</p>
                            </div>
                        </div>

                        {/* 3. Medium Card: Gamification */}
                        <div className="glass-panel rounded-3xl p-8 shadow-sm flex flex-col justify-between border border-white/70 min-h-[300px]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[24px]">emoji_events</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Oyunlaştırma & Seri</h3>
                                <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                                    Serini koru, XP kazan, seviye atla ve liderlik tablosunda yerini alarak arkadaşlarınla yarış.
                                </p>
                            </div>
                            
                            {/* Simulated Streak Flame */}
                            <div className="flex items-center justify-between bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-orange-600 text-2xl">local_fire_department</span>
                                    <div>
                                        <div className="font-extrabold text-sm text-orange-700">7 Günlük Seri</div>
                                        <div className="text-[10px] text-orange-600">Her gün İngilizce</div>
                                    </div>
                                </div>
                                <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">+100 XP</span>
                            </div>
                        </div>

                        {/* 4. Large Card: 7 Study Modes (Span 2 cols) */}
                        <div className="md:col-span-2 glass-panel rounded-3xl p-8 shadow-sm flex flex-col justify-between border border-white/70 min-h-[300px]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[24px]">language</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#0f172a] mb-2">7 İnteraktif Çalışma Modu</h3>
                                <p className="text-[#64748b] text-sm max-w-md mb-6 leading-relaxed">
                                    Görsel, işitsel veya yazılı. Hangi çalışma şeklini seversen sev, VocabMaster'da sana uygun bir çalışma modu mutlaka var.
                                </p>
                            </div>

                            {/* Study Tab Pills */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {[
                                    { id: 'flash', label: 'Flashcard', icon: 'card_membership' },
                                    { id: 'quiz', label: 'Quiz Testi', icon: 'quiz' },
                                    { id: 'speak', label: 'Konuşma (AI)', icon: 'record_voice_over' },
                                    { id: 'match', label: 'Eşleştirme', icon: 'splitscreen' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveStudyTab(tab.id as any)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                            activeStudyTab === tab.id
                                                ? 'bg-[#135bec] text-white shadow-md'
                                                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-20 px-4 border-y border-slate-200/40 bg-white/40 backdrop-blur-md relative z-10">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '12,500+', label: 'Aktif Kullanıcı' },
                        { value: '850K+', label: 'Öğrenilen Kelime' },
                        { value: '%97', label: 'Memnuniyet Oranı', highlight: true },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className={`text-3xl md:text-5xl font-extrabold ${s.highlight ? 'text-[#135bec]' : 'text-[#0f172a]'}`}>{s.value}</p>
                            <p className="text-[#64748b] text-xs md:text-sm font-semibold mt-2">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ PRICING ═══ */}
            <section id="pricing" className="py-28 px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[#135bec] font-bold text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Fiyatlandırma</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mt-4 mb-4">Sana en uygun planı seç</h2>
                        <p className="text-[#64748b] text-lg">Ücretsiz başla, dilediğin an planını değiştir veya yükselt.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {[
                            { name: 'Ücretsiz', price: '₺0', period: 'sonsuza dek', popular: false, gradient: '', features: ['Günde 10 kelime limit', '3 kelime listesi', '3 çalışma modu', 'Temel istatistikler', '5 AI üretim / gün'], cta: 'Hemen Başla', ctaStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' },
                            { name: 'Lite', price: '₺29.99', period: '/ay', popular: true, gradient: 'from-[#135bec] to-blue-600', features: ['Günde 50 kelime limit', '10 kelime listesi', '5 çalışma modu', 'Detaylı istatistikler', '30 AI üretim / gün', 'Excel içe aktarma', 'Reklamsız deneyim'], cta: "Lite'a Yükselt", ctaStyle: 'bg-gradient-to-r from-[#135bec] to-blue-600 text-white shadow-[0_10px_20px_rgba(19,91,236,0.2)]' },
                            { name: 'Pro', price: '₺59.99', period: '/ay', popular: false, gradient: 'from-purple-500 to-fuchsia-600', features: ['Sınırsız kelime ekleme', 'Sınırsız liste oluşturma', 'Tüm 7 çalışma modu', 'Gelişmiş analitikler', 'Sınırsız AI kullanımı', 'AI Story modu', 'Öncelikli destek hattı', 'Reklamsız deneyim'], cta: "Pro'ya Yükselt", ctaStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_10px_20px_rgba(147,51,234,0.2)]' },
                        ].map((plan) => (
                            <div key={plan.name} className={`relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border flex flex-col justify-between ${plan.popular ? 'border-[#135bec] shadow-[0_20px_45px_-10px_rgba(19,91,236,0.12)] md:scale-105 z-10' : 'border-slate-200/60 shadow-sm'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">En Popüler</div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-[#0f172a] mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-extrabold text-[#0f172a]">{plan.price}</span>
                                        <span className="text-[#64748b] text-sm font-semibold">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm text-[#475569]">
                                                <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href="/register" className={`w-full py-4 rounded-full font-bold text-center block transition-all hover:scale-[1.01] text-sm ${plan.ctaStyle}`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-28 px-4 border-t border-slate-200/40 bg-white/30 backdrop-blur-md relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[#135bec] font-bold text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Kullanıcılar</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mt-4">Bizimle öğrenenler ne diyor?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Elif K.', role: 'Üniversite Öğrencisi', text: 'YDS hazırlığımda VocabMaster sayesinde 3 ayda 2000+ kelime öğrendim. Akıllı tekrar sistemi gerçekten mucize gibi!' },
                            { name: 'Ahmet Y.', role: 'Yazılım Mühendisi', text: 'Teknik İngilizce kelimelerimi güçlendirmek için harika. AI ile üretilen bağlamsal örnek cümleler çok akılda kalıcı.' },
                            { name: 'Zeynep D.', role: 'Lise Öğretmeni', text: 'Öğrencilerime kelime listesi hazırlamak artık çok kolay. Sınıfça yarışıyoruz ve öğrenme sürecimiz eğlenerek sürüyor!' },
                        ].map((t) => (
                            <div key={t.name} className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 mb-5">
                                        {[1,2,3,4,5].map((s) => (
                                            <span key={s} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-[#475569] text-sm leading-relaxed mb-6 italic">&quot;{t.text}&quot;</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                                    <div>
                                        <p className="text-[#0f172a] font-bold text-sm">{t.name}</p>
                                        <p className="text-[#64748b] text-xs font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="py-28 px-4 border-t border-slate-200/40 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[#135bec] font-bold text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">SSS</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mt-4">Sıkça Sorulan Sorular</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: 'VocabMaster nasıl çalışır?', a: 'Kelime listeleri oluşturursun, AI yardımıyla açıklamalar üretilir ve akıllı tekrar sistemi (SRS) ile en verimli zamanlarda pratik yaparsın.' },
                            { q: 'Ücretsiz plan yeterli mi?', a: 'Ücretsiz plan günde 10 kelime ve 3 çalışma moduyla temel ihtiyaçları karşılar. Daha yoğun çalışma için Lite veya Pro planlarına geçebilirsin.' },
                            { q: 'Hangi dilleri destekliyorsunuz?', a: 'Şu anda İngilizce-Türkçe destekleniyor. İleride Almanca, Fransızca ve İspanyolca da eklenecek.' },
                            { q: 'Mobilde kullanabilir miyim?', a: 'Evet! VocabMaster PWA desteklidir, telefonunuza uygulama olarak ekleyebilirsiniz.' },
                        ].map((faq, i) => (
                            <button
                                key={i}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full text-left bg-white/80 border border-slate-200/50 rounded-2xl overflow-hidden hover:border-slate-300 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between p-6">
                                    <span className="text-[#0f172a] font-bold pr-4 text-sm md:text-base">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-[#135bec] transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                                {openFaq === i && (
                                    <p className="px-6 pb-6 text-[#64748b] text-sm leading-relaxed animate-fadeIn">{faq.a}</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-24 px-4 border-t border-slate-200/40 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mb-5">Hafızanı güçlendirmeye hazır mısın?</h2>
                    <p className="text-[#64748b] text-lg mb-10 max-w-xl mx-auto">Hemen bugün ücretsiz kaydol, akıllı algoritmamızla dil becerilerini dönüştür.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_10px_25px_-5px_rgba(19,91,236,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(19,91,236,0.4)] hover:scale-105 transition-all"
                    >
                        Ücretsiz Başla
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-slate-200/40 py-12 bg-white/40">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                    <span className="material-symbols-outlined text-white text-[18px]">school</span>
                                </div>
                                <span className="text-[#0f172a] font-bold">VocabMaster</span>
                            </div>
                            <p className="text-[#64748b] text-sm">AI destekli kelime öğrenme platformu.</p>
                        </div>
                        <div>
                            <h4 className="text-[#0f172a] font-bold text-sm mb-4">Platform</h4>
                            <div className="space-y-3 text-sm text-[#64748b]">
                                <a href="#pricing" className="block hover:text-[#0f172a] transition-colors">Fiyatlandırma</a>
                                <Link href="/register" className="block hover:text-[#0f172a] transition-colors">Ücretsiz Başla</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[#0f172a] font-bold text-sm mb-4">Destek</h4>
                            <div className="space-y-3 text-sm text-[#64748b]">
                                <Link href="/about" className="block hover:text-[#0f172a] transition-colors">Hakkımızda</Link>
                                <Link href="/contact" className="block hover:text-[#0f172a] transition-colors">İletişim</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[#0f172a] font-bold text-sm mb-4">Yasal</h4>
                            <div className="space-y-3 text-sm text-[#64748b]">
                                <Link href="/privacy" className="block hover:text-[#0f172a] transition-colors">Gizlilik Politikası</Link>
                                <Link href="/terms" className="block hover:text-[#0f172a] transition-colors">Kullanım Koşulları</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-200/50 pt-8">
                        <p className="text-[#64748b] text-sm text-center">
                            © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-16px); }
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
