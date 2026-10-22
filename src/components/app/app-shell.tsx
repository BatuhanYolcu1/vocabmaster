'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Award,
  BarChart3,
  ChevronsUpDown,
  Flame,
  GraduationCap,
  Home,
  Layers,
  Library,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Logo, LogoMark } from '@/components/logo';
import { Avatar } from '@/components/ui/misc';
import { ThemeSwitcher } from '@/components/theme';
import { AnnouncementBar, type Announcement } from './announcement-bar';

export interface ShellUser {
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  isPro: boolean;
  streak: number;
  studiedToday: boolean;
  level: number;
  levelProgress: number;
  xp: number;
  dueNow: number;
}

const NAV = [
  { href: '/dashboard', label: 'Bugün', icon: Home },
  { href: '/study', label: 'Çalış', icon: GraduationCap },
  { href: '/lists', label: 'Listelerim', icon: Layers },
  { href: '/library', label: 'Kütüphane', icon: Library },
  { href: '/stats', label: 'İstatistikler', icon: BarChart3 },
  { href: '/leaderboard', label: 'Sıralama', icon: Trophy },
  { href: '/achievements', label: 'Başarımlar', icon: Award },
] as const;

const MOBILE_TABS = NAV.slice(0, 4);

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function StreakPill({ streak, active, className }: { streak: number; active: boolean; className?: string }) {
  return (
    <span
      title={active ? 'Bugün serini korudun' : 'Serini korumak için bugün çalış'}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold tabular',
        active ? 'bg-streak-soft text-streak' : 'bg-surface-2 text-muted',
        className,
      )}
    >
      <Flame className={cn('size-4', active && 'fill-current')} aria-hidden />
      {streak}
      <span className="sr-only">günlük seri</span>
    </span>
  );
}

function NavLinks({ pathname, onNavigate, user }: { pathname: string; onNavigate?: () => void; user: ShellUser }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Ana menü">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
              active ? 'bg-primary-soft text-primary-soft-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {href === '/study' && user.dueNow > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary-fg tabular">
                {user.dueNow > 99 ? '99+' : user.dueNow}
              </span>
            )}
          </Link>
        );
      })}
      {user.isAdmin && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Shield className="size-5" aria-hidden />
          Yönetim
        </Link>
      )}
    </nav>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-2"
      >
        <Avatar name={user.name} image={user.image} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg">{user.name ?? 'Hesabım'}</span>
          <span className="block truncate text-xs text-muted">{user.isPro ? 'Pro üye' : 'Ücretsiz plan'}</span>
        </span>
        <ChevronsUpDown className="size-4 text-subtle" aria-hidden />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute bottom-full left-0 z-50 mb-2 w-full min-w-60 animate-fade-in rounded-xl border border-border bg-surface p-1.5 shadow-lg"
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <Link
              role="menuitem"
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg hover:bg-surface-2"
            >
              <Settings className="size-4 text-muted" /> Ayarlar
            </Link>
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-sm text-fg">
              Tema
              <ThemeSwitcher compact />
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              role="menuitem"
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut className="size-4" /> Çıkış yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LevelCard({ user }: { user: ShellUser }) {
  return (
    <Link href="/stats" className="block rounded-xl border border-border p-3 transition-colors hover:bg-surface-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-fg">Seviye {user.level}</span>
        <span className="tabular text-muted">{formatNumber(user.xp)} XP</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-xp" style={{ width: `${Math.round(user.levelProgress * 100)}%` }} />
      </div>
    </Link>
  );
}

export function AppShell({
  user,
  announcements,
  children,
}: {
  user: ShellUser;
  announcements: Announcement[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  // Study sessions get the whole screen.
  const focusMode = /^\/study\/(?!$)[^/]+/.test(pathname) && pathname !== '/study/story';

  if (focusMode) return <div className="min-h-dvh">{children}</div>;

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/dashboard" />
        </div>
        <div className="flex items-center gap-2 px-5 pb-4">
          <StreakPill streak={user.streak} active={user.studiedToday} />
          {user.isPro && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-soft px-2.5 py-1 text-xs font-bold text-violet">
              <Sparkles className="size-3.5" /> PRO
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks pathname={pathname} user={user} />
        </div>
        <div className="space-y-2 border-t border-border p-3">
          {!user.isPro && (
            <Link
              href="/pricing"
              className="flex items-center gap-2.5 rounded-xl bg-violet-soft px-3 py-2.5 text-sm font-semibold text-violet transition hover:brightness-95 dark:hover:brightness-125"
            >
              <Sparkles className="size-4" /> Pro’yu keşfet
            </Link>
          )}
          <LevelCard user={user} />
          <UserMenu user={user} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" aria-label="Bugün">
          <LogoMark />
        </Link>
        <div className="flex items-center gap-2">
          <StreakPill streak={user.streak} active={user.studiedToday} />
          <Link href="/settings" aria-label="Ayarlar">
            <Avatar name={user.name} image={user.image} size={32} />
          </Link>
        </div>
      </header>

      <AnnouncementBar items={announcements} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Alt menü"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                  active ? 'text-primary' : 'text-muted',
                )}
              >
                <Icon className="size-[22px]" aria-hidden />
                {label === 'Listelerim' ? 'Listeler' : label}
                {href === '/study' && user.dueNow > 0 && (
                  <span className="absolute right-[22%] top-1.5 size-2 rounded-full bg-primary ring-2 ring-surface" />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted"
          >
            <Menu className="size-[22px]" aria-hidden />
            Daha fazla
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="safe-bottom absolute inset-x-0 bottom-0 animate-fade-in rounded-t-3xl border-t border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base font-bold">Menü</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2"
                aria-label="Kapat"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMoreOpen(false)} user={user} />
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              <Link
                href="/settings"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted hover:bg-surface-2"
              >
                <Settings className="size-5" /> Ayarlar
              </Link>
              {!user.isPro && (
                <Link
                  href="/pricing"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-violet-soft px-3 py-2.5 text-[15px] font-semibold text-violet"
                >
                  <Sparkles className="size-5" /> Pro’yu keşfet
                </Link>
              )}
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted">Tema</span>
                <ThemeSwitcher />
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-danger hover:bg-danger-soft"
              >
                <LogOut className="size-5" /> Çıkış yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
