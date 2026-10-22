'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ButtonLink } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/theme';

const LINKS = [
  { href: '/#nasil', label: 'Nasıl çalışır' },
  { href: '/#modlar', label: 'Çalışma modları' },
  { href: '/pricing', label: 'Fiyatlar' },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Site menüsü">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggleButton />
          {signedIn ? (
            <ButtonLink href="/dashboard" size="sm" className="h-9 px-4">
              Uygulamaya git
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm" className="hidden h-9 sm:inline-flex">
                Giriş yap
              </ButtonLink>
              <ButtonLink href="/register" size="sm" className="h-9 px-4">
                Ücretsiz başla
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 md:hidden"
            aria-label="Menü"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-5 py-3 md:hidden" aria-label="Mobil site menüsü">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 font-medium text-muted hover:text-fg">
              {l.label}
            </Link>
          ))}
          {!signedIn && (
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 font-medium text-muted hover:text-fg">
              Giriş yap
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
