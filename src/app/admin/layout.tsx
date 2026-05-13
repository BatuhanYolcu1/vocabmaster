'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const adminLinks = [
    { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { href: '/admin/users', icon: 'group', label: 'Kullanıcılar' },
    { href: '/admin/words', icon: 'dictionary', label: 'Kelimeler' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) { router.push('/login'); return; }

        fetch('/api/admin/stats')
            .then(res => {
                if (res.status === 403) { setIsAdmin(false); router.push('/'); }
                else if (res.ok) { setIsAdmin(true); }
            })
            .catch(() => { setIsAdmin(false); router.push('/'); });
    }, [session, status, router]);

    if (status === 'loading' || isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#0b0f17] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111827]/80 border-r border-white/5 flex flex-col fixed top-0 left-0 h-full z-40 pt-24">
                <div className="px-5 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">shield_person</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Admin Panel</p>
                            <p className="text-[#8b9bb4] text-xs">VocabMaster</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {adminLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                pathname === link.href
                                    ? 'bg-[#135bec] text-white shadow-[0_0_20px_rgba(19,91,236,0.3)]'
                                    : 'text-[#8b9bb4] hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-2 text-[#8b9bb4] hover:text-white text-xs transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Siteye Dön
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 pt-24 px-8 pb-12">
                {children}
            </main>
        </div>
    );
}
