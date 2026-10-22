'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookText, LayoutDashboard, Megaphone, Settings, Ticket, Users } from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { ThemeToggleButton } from '@/components/theme';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Genel bakış', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/words', label: 'Kelimeler', icon: BookText },
  { href: '/admin/announcements', label: 'Duyurular', icon: Megaphone },
  { href: '/admin/coupons', label: 'Kuponlar', icon: Ticket },
  { href: '/admin/settings', label: 'Sistem ayarları', icon: Settings },
];

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <LogoMark />
          <div className="leading-tight">
            <p className="font-display text-sm font-extrabold">VocabMaster</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warning">Yönetim</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Yönetim menüsü">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active(href) ? 'bg-primary-soft text-primary-soft-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <Icon className="size-[18px]" /> {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <p className="truncate px-2 text-xs text-muted">{name}</p>
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-fg">
              <ArrowLeft className="size-4" /> Uygulamaya dön
            </Link>
            <ThemeToggleButton />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted">
            <ArrowLeft className="size-4" /> Uygulama
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-warning">Yönetim</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Yönetim menüsü">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium',
                active(href) ? 'bg-primary-soft text-primary-soft-fg' : 'text-muted',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
