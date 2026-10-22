import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <Link href="/" aria-label="Ana sayfa">
          <LogoMark className="mx-auto size-10" />
        </Link>
        <p className="mt-10 font-display text-7xl font-extrabold tracking-tight text-primary">404</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold">Bu sayfa kaybolmuş</h1>
        <p className="mt-2 text-muted">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. <span className="italic">“Lost”</span> — kaybolmuş, kayıp. Bir kelime daha öğrendin!
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <ButtonLink href="/">Ana sayfaya dön</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            Panelim
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
