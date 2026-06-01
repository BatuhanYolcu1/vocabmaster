'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, X, Zap, Gem } from 'lucide-react';

const plans = [
  {
    name: 'Ücretsiz',
    price: '₺0',
    period: 'sonsuza dek',
    icon: Zap,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    border: 'border-white/8',
    features: [
      { text: 'Sınırsız kelime & liste', included: true },
      { text: 'Tüm 8 çalışma modu', included: true },
      { text: 'SRS akıllı tekrar sistemi', included: true },
      { text: 'Detaylı istatistikler', included: true },
      { text: 'Günde 5 AI üretim', included: true },
      { text: 'Sınırsız AI üretim', included: false },
      { text: 'Excel/CSV içe aktarma', included: false },
      { text: 'Öncelikli destek', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '₺49.99',
    period: '/ay',
    icon: Gem,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    popular: true,
    features: [
      { text: 'Sınırsız kelime & liste', included: true },
      { text: 'Tüm 8 çalışma modu', included: true },
      { text: 'SRS akıllı tekrar sistemi', included: true },
      { text: 'Detaylı istatistikler', included: true },
      { text: 'Sınırsız AI üretim', included: true },
      { text: 'Excel/CSV içe aktarma', included: true },
      { text: 'Story modu (AI hikaye)', included: true },
      { text: 'Öncelikli destek', included: true },
    ],
  },
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Sana uygun planı seç
          </h1>
          <p className="text-[#6b7a94] text-lg max-w-md mx-auto">
            Ücretsiz başla, Pro ile limitleri kaldır. İstediğin zaman iptal edebilirsin.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const href = plan.name === 'Ücretsiz'
              ? (session ? '/study/select' : '/register')
              : `/checkout?plan=pro`;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col bg-[#111827] ${plan.border} ${(plan as { popular?: boolean }).popular ? 'ring-1 ring-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.08)]' : ''}`}
              >
                {(plan as { popular?: boolean }).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold tracking-wide">
                    En Popüler
                  </div>
                )}

                <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center mb-5`}>
                  <PlanIcon className={plan.iconColor} size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-[#6b7a94] text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      {f.included
                        ? <Check size={16} className="text-emerald-400 shrink-0" />
                        : <X size={16} className="text-[#6b7a94]/40 shrink-0" />}
                      <span className={f.included ? 'text-[#c4d0e4]' : 'text-[#6b7a94]/50'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={href}
                  className={`w-full py-3 rounded-xl font-semibold text-center transition-all text-sm ${
                    (plan as { popular?: boolean }).popular
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-white/6 hover:bg-white/10 text-white border border-white/8'
                  }`}
                >
                  {plan.name === 'Ücretsiz' ? 'Ücretsiz Başla' : "Pro'ya Geç"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Ücretsiz planda neler var?',
                a: 'Sınırsız kelime, sınırsız liste, tüm 8 çalışma modu, SRS sistemi ve günde 5 AI üretim — tamamen ücretsiz.',
              },
              {
                q: 'Pro planı iptal edebilir miyim?',
                a: 'Evet, istediğin zaman ve herhangi bir ceza olmadan iptal edebilirsin. Ödeme dönemin sonuna kadar Pro özelliklere erişimin devam eder.',
              },
              {
                q: "Pro ve Ücretsiz arasındaki fark ne?",
                a: "Pro plan; sınırsız AI üretim, Excel/CSV içe aktarma, Story modu ve öncelikli destek sunar. Öğrenme deneyimi için Ücretsiz plan fazlasıyla yeterlidir.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl bg-[#111827] border border-white/6 p-5">
                <h4 className="font-medium mb-2 text-white">{item.q}</h4>
                <p className="text-[#6b7a94] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
