import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check } from 'lucide-react';
import { Logo, LogoMark } from '@/components/logo';
import { ThemeToggleButton } from '@/components/theme';
import { getSessionUserId } from '@/server/session';

const POINTS = [
  'Unutmak üzereyken tekrar: aralıklı tekrar (SRS)',
  '7 farklı çalışma modu, seviyene göre kelimeler',
  'Kendi listelerin, istersen yapay zekâ desteğiyle',
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSessionUserId()) redirect('/dashboard');

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-fg lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-[0.08] bg-grid [--border:#fff]" aria-hidden />
        <Link href="/" className="relative flex items-center gap-2.5 font-display text-lg font-extrabold">
          <LogoMark inverse className="size-9" />
          VocabMaster
        </Link>
        <div className="relative mt-auto max-w-md">
          <p className="font-display text-3xl font-extrabold leading-tight">
            Her gün birkaç dakika.
            <br />
            Kalıcı bir kelime dağarcığı.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] opacity-95">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          {/* A sample card, so the product is visible right away */}
          <div className="mt-10 w-72 rotate-[-3deg] rounded-2xl bg-white p-5 text-fg shadow-lg [--fg:#101828]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#546072]">sıfat · B2</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#101828]">resilient</p>
            <p className="text-sm text-[#546072]">/rɪˈzɪliənt/</p>
            <div className="mt-4 h-px bg-[#e2e6ef]" />
            <p className="mt-3 text-sm font-semibold text-[#135bec]">dayanıklı, çabuk toparlanan</p>
          </div>
        </div>
      </aside>
      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between p-5 sm:px-8">
          <Logo className="lg:invisible" />
          <ThemeToggleButton />
        </div>
        <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
