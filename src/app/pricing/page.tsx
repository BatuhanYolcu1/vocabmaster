'use client';

import Link from 'next/link';
import { useState } from 'react';

const plans = [
    {
        name: 'Ücretsiz', price: '₺0', period: 'sonsuza dek', popular: false, color: 'from-slate-400 to-slate-600',
        features: [
            { text: 'Günde 10 kelime', included: true },
            { text: '3 kelime listesi', included: true },
            { text: '3 çalışma modu', included: true },
            { text: 'Temel istatistikler', included: true },
            { text: '5 AI üretim/gün', included: true },
            { text: 'Excel içe aktarma', included: false },
            { text: 'Story modu', included: false },
            { text: 'Öncelikli destek', included: false },
        ],
    },
    {
        name: 'Lite', price: '₺29.99', period: '/ay', popular: true, color: 'from-[#135bec] to-blue-600',
        features: [
            { text: 'Günde 50 kelime', included: true },
            { text: '10 kelime listesi', included: true },
            { text: '5 çalışma modu', included: true },
            { text: 'Detaylı istatistikler', included: true },
            { text: '30 AI üretim/gün', included: true },
            { text: 'Excel içe aktarma', included: true },
            { text: 'Story modu', included: false },
            { text: 'Öncelikli destek', included: false },
        ],
    },
    {
        name: 'Pro', price: '₺59.99', period: '/ay', popular: false, color: 'from-purple-600 to-fuchsia-600',
        features: [
            { text: 'Sınırsız kelime', included: true },
            { text: 'Sınırsız liste', included: true },
            { text: 'Tüm 7 mod', included: true },
            { text: 'Tam istatistikler', included: true },
            { text: 'Sınırsız AI', included: true },
            { text: 'Excel içe aktarma', included: true },
            { text: 'Story modu', included: true },
            { text: 'Öncelikli destek', included: true },
        ],
    },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Sana uygun planı seç</h1>
                    <p className="text-[#8b9bb4] text-lg max-w-lg mx-auto mb-8">Ücretsiz başla, ihtiyacına göre yükselt. İstediğin zaman iptal edebilirsin.</p>
                    <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
                        <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-[#135bec] text-white' : 'text-[#8b9bb4]'}`}>Aylık</button>
                        <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? 'bg-[#135bec] text-white' : 'text-[#8b9bb4]'}`}>
                            Yıllık <span className="text-emerald-400 text-xs ml-1">%20 indirim</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        const displayPrice = plan.price === '₺0' ? '₺0' :
                            annual ? `₺${(parseFloat(plan.price.replace('₺', '')) * 0.8).toFixed(2)}` : plan.price;
                        return (
                            <div key={plan.name} className={`relative glass-panel rounded-3xl p-7 flex flex-col ${plan.popular ? 'border-[#135bec]/50 shadow-[0_0_40px_rgba(19,91,236,0.15)] md:scale-105' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#135bec] to-blue-600 text-white text-xs font-bold">En Popüler</div>
                                )}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                    <span className="material-symbols-outlined text-white">{plan.name === 'Ücretsiz' ? 'stars' : plan.name === 'Lite' ? 'bolt' : 'diamond'}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black">{displayPrice}</span>
                                    <span className="text-[#8b9bb4] text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map(f => (
                                        <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? 'text-[#c4d0e4]' : 'text-[#8b9bb4]/50 line-through'}`}>
                                            <span className={`material-symbols-outlined text-base ${f.included ? 'text-emerald-400' : 'text-[#8b9bb4]/30'}`}>
                                                {f.included ? 'check_circle' : 'cancel'}
                                            </span>
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`w-full py-3 rounded-xl font-bold text-center block transition-all hover:scale-105 ${plan.popular ? 'bg-gradient-to-r from-[#135bec] to-blue-600 text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]' : 'glass-button text-white'}`}>
                                    {plan.name === 'Ücretsiz' ? 'Hemen Başla' : `${plan.name}'a Geç`}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
