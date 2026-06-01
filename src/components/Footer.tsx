'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Landing page has its own footer
    if (!session && pathname === '/') return null;
    
    // Hide footer on study modes, login/register, onboarding
    const hideFooterRoutes = ['/study/', '/login', '/register', '/onboarding'];
    if (hideFooterRoutes.some(route => pathname.startsWith(route))) return null;

    return (
        <footer className="relative z-10 border-t border-slate-200/50 py-8 mt-8 bg-slate-50/50">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                <GraduationCap size={16} className="text-white" />
                            </div>
                            <span className="text-[#0f172a] font-bold text-sm">VocabMaster</span>
                        </div>
                        <p className="text-[#64748b] text-xs leading-relaxed">AI destekli kelime öğrenme platformu.</p>
                    </div>
                    {session && (
                        <div>
                            <h4 className="text-[#0f172a] font-semibold text-xs mb-3 uppercase tracking-wider">Platform</h4>
                            <div className="space-y-2 text-xs text-[#64748b]">
                                <Link href="/categories" className="block hover:text-[#0f172a] transition-colors">Kelimeler</Link>
                                <Link href="/study/select" className="block hover:text-[#0f172a] transition-colors">Pratik</Link>
                                <Link href="/leaderboard" className="block hover:text-[#0f172a] transition-colors">Liderlik</Link>
                                <Link href="/achievements" className="block hover:text-[#0f172a] transition-colors">Başarımlar</Link>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="text-[#0f172a] font-semibold text-xs mb-3 uppercase tracking-wider">Şirket</h4>
                        <div className="space-y-2 text-xs text-[#64748b]">
                            <Link href="/about" className="block hover:text-[#0f172a] transition-colors">Hakkımızda</Link>
                            <Link href="/pricing" className="block hover:text-[#0f172a] transition-colors">Fiyatlandırma</Link>
                            <Link href="/contact" className="block hover:text-[#0f172a] transition-colors">İletişim</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[#0f172a] font-semibold text-xs mb-3 uppercase tracking-wider">Yasal</h4>
                        <div className="space-y-2 text-xs text-[#64748b]">
                            <Link href="/privacy" className="block hover:text-[#0f172a] transition-colors">Gizlilik Politikası</Link>
                            <Link href="/terms" className="block hover:text-[#0f172a] transition-colors">Kullanım Koşulları</Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-200/50 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-[#64748b] text-xs">
                        © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    );
}
