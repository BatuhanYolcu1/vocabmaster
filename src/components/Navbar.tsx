'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BookOpen, BarChart3, Trophy, User, LogOut, Menu, X,
  Flame, BookMarked, GraduationCap, ChevronDown,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/study/select', label: 'Çalış' },
  { href: '/wordlists/new', label: 'Listelerim', matchPrefix: '/wordlists' },
  { href: '/leaderboard', label: 'Sıralama' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string, prefix?: string) => {
    if (prefix) return pathname.startsWith(prefix);
    return pathname === href;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0b0f17]/90 backdrop-blur-md border-b border-white/6">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#135bec] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-[15px]">VocabMaster</span>
        </Link>

        {/* Desktop Nav */}
        {session && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href, link.matchPrefix)
                    ? 'bg-[#135bec]/15 text-[#135bec]'
                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse" />
          ) : session ? (
            <>
              {/* Profile dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/6 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#135bec]/20 border border-[#135bec]/30 flex items-center justify-center">
                    <User size={14} className="text-[#135bec]" />
                  </div>
                  <span className="text-sm text-white font-medium max-w-[100px] truncate">
                    {session.user?.name?.split(' ')[0] ?? 'Hesap'}
                  </span>
                  <ChevronDown size={14} className={`text-[#6b7a94] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111827] border border-white/8 shadow-2xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/6">
                        <p className="text-xs text-[#6b7a94]">Giriş yapıldı</p>
                        <p className="text-sm font-medium text-white truncate">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                          <User size={15} className="text-[#6b7a94]" />
                          Profil
                        </Link>
                        <Link href="/statistics" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                          <BarChart3 size={15} className="text-[#6b7a94]" />
                          İstatistikler
                        </Link>
                        <Link href="/achievements" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                          <Trophy size={15} className="text-[#6b7a94]" />
                          Başarılar
                        </Link>
                        <Link href="/pricing" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                          <Flame size={15} className="text-[#6b7a94]" />
                          Pro'ya Geç
                        </Link>
                      </div>
                      <div className="py-1 border-t border-white/6">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/8 transition-colors"
                        >
                          <LogOut size={15} />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/6 transition-colors text-[#8b9bb4]"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm text-[#8b9bb4] hover:text-white transition-colors font-medium">
                Giriş Yap
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-[#135bec] text-white rounded-lg font-medium hover:bg-[#1a6ef5] transition-colors">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && session && (
        <div className="md:hidden border-t border-white/6 bg-[#0b0f17]">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href, link.matchPrefix)
                    ? 'bg-[#135bec]/15 text-[#135bec]'
                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/6 space-y-1">
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                <User size={16} className="text-[#6b7a94]" />
                Profil
              </Link>
              <Link href="/statistics" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#c4d0e4] hover:bg-white/5 transition-colors">
                <BarChart3 size={16} className="text-[#6b7a94]" />
                İstatistikler
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/8 transition-colors"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
