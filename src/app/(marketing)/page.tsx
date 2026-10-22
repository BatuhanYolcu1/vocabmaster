import { redirect } from 'next/navigation';
import { ArrowRight, BarChart3, BookOpen, Check, Flame, Layers, Library, Smartphone, Sparkles, Target } from 'lucide-react';
import { getSessionUserId } from '@/server/session';
import { prisma } from '@/server/db';
import { ButtonLink } from '@/components/ui/button';
import { DemoCard } from '@/components/marketing/demo-card';
import { ForgettingCurve } from '@/components/marketing/forgetting-curve';
import { MODE_ICONS, MODE_TONES } from '@/components/study/mode-icons';
import { STUDY_MODES, STUDY_MODE_INFO } from '@/lib/study-modes';
import { PLAN_FEATURES, PRO_MONTHLY_PRICE, formatPrice } from '@/lib/plans';
import { cn } from '@/lib/utils';


const FAQ = [
  {
    q: 'VocabMaster ücretsiz mi?',
    a: 'Evet. Kelime ekleme, listeler, 7 çalışma modu, akıllı tekrar, istatistikler ve kütüphane tamamen ücretsiz ve sınırsız. Pro yalnızca yapay zekâ ağırlıklı ek özellikler sunar.',
  },
  {
    q: 'Aralıklı tekrar (SRS) nedir?',
    a: 'Bir kelimeyi unutmak üzereyken tekrar etmek onu daha uzun süre hatırlamanı sağlar. VocabMaster her cevabına göre kelimenin bir sonraki tekrar tarihini hesaplar: iyi bildiklerin seyrek, zorlandıkların sık karşına çıkar.',
  },
  {
    q: 'Günde ne kadar zaman ayırmalıyım?',
    a: 'Günde 5–10 dakika yeterli. Düzenli kısa çalışmalar, haftada bir yapılan uzun çalışmalardan çok daha etkilidir. Günlük hedefini kendin belirlersin.',
  },
  {
    q: 'Kendi kelimelerimi ekleyebilir miyim?',
    a: 'Elbette. Kelimeleri tek tek, yapıştırarak ya da (Pro’da) Excel/CSV dosyasından ekleyebilirsin. İstersen yapay zekâ anlamını, örnek cümlesini ve telaffuzunu doldurur.',
  },
  {
    q: 'Telefonda kullanabilir miyim?',
    a: 'Evet. VocabMaster telefonda tarayıcıdan sorunsuz çalışır ve ana ekrana uygulama gibi eklenebilir.',
  },
];

export default async function HomePage() {
  if (await getSessionUserId()) redirect('/dashboard');
  const libraryCount = await prisma.word.count({ where: { isSystem: true } }).catch(() => 0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-sm">
              <span className="size-1.5 rounded-full bg-success" /> Ücretsiz · Kredi kartı gerekmez
            </span>
            <h1 className="mt-6 font-display text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              İngilizce kelimeleri <span className="text-primary">unutmadan</span> öğren.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              VocabMaster her kelimeyi tam unutmak üzereyken karşına çıkarır. Günde birkaç dakikayla kelime dağarcığın kalıcı olarak büyür.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg">
                Ücretsiz başla <ArrowRight />
              </ButtonLink>
              <ButtonLink href="#nasil" size="lg" variant="secondary">
                Nasıl çalışır?
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {[
                libraryCount > 0 ? `${libraryCount} hazır kelime` : 'Hazır kelime kütüphanesi',
                '7 çalışma modu',
                'A1’den C2’ye',
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <DemoCard />
        </div>
      </section>

      {/* Why */}
      <section id="nasil" className="scroll-mt-20 border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-primary">Neden kalıcı?</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Ezberlediğin kelimeleri neden unutuyorsun?</h2>
            <p className="mt-4 text-muted">
              Yeni öğrenilen bilgi birkaç gün içinde hızla unutulur. Çözüm daha çok çalışmak değil, <strong className="text-fg">doğru zamanda</strong> tekrar etmek.
              VocabMaster her cevabından sonra kelimenin bir sonraki tekrar tarihini hesaplar.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                { icon: Target, t: 'Çalış', b: 'Kartlar, testler, yazma, dinleme ve konuşma — sana uyan modu seç.' },
                { icon: BarChart3, t: 'Sistem takip etsin', b: 'Bildiğin kelimeler seyrekleşir, zorlandıkların daha sık gelir.' },
                { icon: Flame, t: 'Her gün birkaç dakika', b: 'Günlük hedefini tamamla, serini koru, kalıcı ilerlemeyi gör.' },
              ].map(({ icon: Icon, t, b }, i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">
                      {i + 1}. {t}
                    </p>
                    <p className="text-sm text-muted">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-border bg-bg p-5 sm:p-7">
            <p className="mb-4 font-display text-lg font-bold">Hafızada kalma oranı</p>
            <ForgettingCurve />
          </div>
        </div>
      </section>

      {/* Modes */}
      <section id="modlar" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Çalışma modları</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Bir kelimeyi gerçekten bilmek için 7 farklı yol</h2>
            <p className="mt-4 text-muted">Tanımak, hatırlamak, yazmak, duymak ve söylemek farklı becerilerdir. Hepsi aynı tekrar takvimine işlenir.</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STUDY_MODES.map((m) => {
              const Icon = MODE_ICONS[m];
              const info = STUDY_MODE_INFO[m];
              return (
                <div key={m} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <span className={cn('grid size-10 place-items-center rounded-xl', MODE_TONES[m])}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-semibold">{info.name}</p>
                  <p className="mt-1 text-sm text-muted">{info.description}</p>
                </div>
              );
            })}
            <div className="rounded-2xl border border-dashed border-violet/40 bg-violet-soft p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-violet text-white">
                <BookOpen className="size-5" />
              </span>
              <p className="mt-4 flex items-center gap-2 font-semibold">
                Hikâye modu <span className="rounded-full bg-violet px-1.5 py-0.5 text-[10px] font-bold text-white">PRO</span>
              </p>
              <p className="mt-1 text-sm text-muted">Yapay zekâ, öğrendiğin kelimelerle sana özel kısa hikâyeler yazar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Library, t: 'Hazır kütüphane', b: 'Temel, iş, akademik, seyahat, teknoloji ve sağlık kelimeleri; tanım, örnek cümle ve telaffuzuyla.' },
            { icon: Layers, t: 'Kendi listelerin', b: 'Okuduğun kitaptan, izlediğin diziden ya da sınav kaynağından kendi listeni oluştur.' },
            { icon: Sparkles, t: 'Yapay zekâ desteği', b: 'Kelimeyi yaz; anlamı, örnek cümlesi ve telaffuzu otomatik gelsin. Metinden kelime çıkar.' },
            { icon: Smartphone, t: 'Her yerde', b: 'Telefon, tablet ve bilgisayarda çalışır. Açık ve koyu tema, klavye kısayolları.' },
          ].map(({ icon: Icon, t, b }) => (
            <div key={t}>
              <Icon className="size-6 text-primary" />
              <p className="mt-4 font-display text-lg font-bold">{t}</p>
              <p className="mt-1.5 text-sm text-muted">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Öğrenmek için ödeme yapman gerekmiyor</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">Temel her şey ücretsiz ve sınırsız. Yapay zekâyı daha çok kullanmak istersen Pro var.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            {(['free', 'pro'] as const).map((p) => (
              <div key={p} className={cn('rounded-3xl border bg-surface p-7 shadow-sm', p === 'pro' ? 'border-violet/40' : 'border-border')}>
                <p className="font-display text-lg font-bold">{p === 'pro' ? 'Pro' : 'Ücretsiz'}</p>
                <p className="mt-2 font-display text-3xl font-extrabold">
                  {p === 'pro' ? formatPrice(PRO_MONTHLY_PRICE) : '₺0'}
                  <span className="text-sm font-medium text-muted">{p === 'pro' ? ' / ay' : ' / sonsuza dek'}</span>
                </p>
                <ul className="mt-5 space-y-2.5">
                  {PLAN_FEATURES.filter((f) => (p === 'pro' ? f.pro : f.free)).map((f) => {
                    const value = p === 'pro' ? f.pro : f.free;
                    return (
                      <li key={f.label} className="flex items-start gap-2 text-sm">
                        <Check className={cn('mt-0.5 size-4 shrink-0', p === 'pro' ? 'text-violet' : 'text-success')} />
                        <span>
                          {f.label}
                          {typeof value === 'string' && <span className="text-muted"> — {value}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center">
            <ButtonLink href="/pricing" variant="ghost">
              Planları karşılaştır <ArrowRight />
            </ButtonLink>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight">Sık sorulan sorular</h2>
          <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-bg">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-fg sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/10" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-white/10" aria-hidden />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Bugün 5 dakika ayır, farkı bir haftada gör.</h2>
            <p className="relative mx-auto mt-3 max-w-lg opacity-90">Ücretsiz hesabını oluştur, seviyeni seç ve ilk kelimelerinle hemen başla.</p>
            <a
              href="/register"
              className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-primary shadow-sm transition hover:bg-white/90"
            >
              Ücretsiz başla <ArrowRight className="size-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
