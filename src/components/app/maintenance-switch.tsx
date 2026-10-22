'use client';

import { usePathname } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { SITE } from '@/lib/constants';

export function MaintenanceSwitch({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAdmin || pathname === '/login') return <>{children}</>;

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto size-12" />
        <div className="mx-auto mt-8 grid size-14 place-items-center rounded-2xl bg-warning-soft text-warning">
          <Wrench className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Kısa bir bakımdayız</h1>
        <p className="mt-2 text-muted">
          VocabMaster’ı daha iyi hâle getirmek için çalışıyoruz. Birazdan tekrar burada olacağız — ilerlemen güvende.
        </p>
        <p className="mt-6 text-sm text-subtle">
          Acil bir durum mu? <a className="font-medium text-primary hover:underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
        </p>
      </div>
    </main>
  );
}
