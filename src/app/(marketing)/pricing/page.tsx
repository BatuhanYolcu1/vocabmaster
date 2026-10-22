import type { Metadata } from 'next';
import { Check, Minus, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/server/session';
import { getPlanInfo } from '@/server/plan';
import { ButtonLink } from '@/components/ui/button';
import { PLAN_FEATURES, PRO_MONTHLY_PRICE, formatPrice } from '@/lib/plans';
import { SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Fiyatlar',
  description: 'VocabMaster’ın temel özellikleri ücretsiz ve sınırsız. Pro ile yapay zekâ özelliklerini sınırsız kullan.',
};

function Value({ v, pro }: { v: boolean | string; pro?: boolean }) {
  if (typeof v === 'string') return <span className="text-sm font-semibold">{v}</span>;
  return v ? (
    <Check className={cn('mx-auto size-5', pro ? 'text-violet' : 'text-success')} aria-label="Var" />
  ) : (
    <Minus className="mx-auto size-5 text-subtle" aria-label="Yok" />
  );
}

export default async function PricingPage() {
  const user = await getCurrentUser();
  const plan = user ? (await getPlanInfo(user.id)).plan : null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Basit ve şeffaf</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Kelime öğrenmek için gereken her şey ücretsiz. Pro, yapay zekâ özelliklerini sınırsız kullanmak isteyenler için.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="flex flex-col rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <p className="font-display text-xl font-bold">Ücretsiz</p>
          <p className="mt-1 text-sm text-muted">Düzenli öğrenmek isteyen herkes için</p>
          <p className="mt-6 font-display text-4xl font-extrabold">₺0</p>
          <p className="text-sm text-muted">sonsuza dek</p>
          <div className="mt-8 flex-1" />
          {plan === 'FREE' ? (
            <span className="inline-flex h-12 items-center justify-center rounded-xl bg-surface-2 text-sm font-semibold text-muted">Şu anki planın</span>
          ) : plan === 'PRO' ? null : (
            <ButtonLink href="/register" variant="secondary" size="lg">
              Ücretsiz başla
            </ButtonLink>
          )}
        </div>

        <div className="relative flex flex-col rounded-3xl border-2 border-violet/50 bg-surface p-8 shadow-md">
          <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-violet px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="size-3.5" /> PRO
          </span>
          <p className="font-display text-xl font-bold">Pro</p>
          <p className="mt-1 text-sm text-muted">Yapay zekâdan en çok faydalanmak isteyenler için</p>
          <p className="mt-6 font-display text-4xl font-extrabold">{formatPrice(PRO_MONTHLY_PRICE)}</p>
          <p className="text-sm text-muted">aylık · istediğin zaman iptal</p>
          <div className="mt-8 flex-1" />
          {plan === 'PRO' ? (
            <span className="inline-flex h-12 items-center justify-center rounded-xl bg-violet-soft text-sm font-semibold text-violet">Pro üyesisin — teşekkürler!</span>
          ) : (
            <div className="rounded-2xl bg-violet-soft p-4 text-sm">
              <p className="font-semibold text-violet">Çevrim içi ödeme çok yakında</p>
              <p className="mt-1 text-muted">
                Güvenli ödeme altyapımızı hazırlıyoruz. O zamana kadar Pro’ya geçmek için{' '}
                <a href={`mailto:${SITE.supportEmail}?subject=Pro üyelik`} className="font-semibold text-violet underline">
                  bize yaz
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface">
        <table className="w-full text-left">
          <caption className="sr-only">Plan karşılaştırması</caption>
          <thead>
            <tr className="border-b border-border bg-surface-2 text-sm">
              <th scope="col" className="px-5 py-3.5 font-semibold">Özellik</th>
              <th scope="col" className="w-28 px-3 py-3.5 text-center font-semibold sm:w-36">Ücretsiz</th>
              <th scope="col" className="w-28 px-3 py-3.5 text-center font-semibold text-violet sm:w-36">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PLAN_FEATURES.map((f) => (
              <tr key={f.label}>
                <th scope="row" className="px-5 py-3.5 text-sm font-normal">
                  {f.label}
                </th>
                <td className="px-3 py-3.5 text-center">
                  <Value v={f.free} />
                </td>
                <td className="px-3 py-3.5 text-center">
                  <Value v={f.pro} pro />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
