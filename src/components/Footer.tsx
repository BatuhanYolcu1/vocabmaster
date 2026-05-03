'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Landing page has its own footer
    if (!session && pathname === '/') return null;

    return (
        <footer className="relative z-10 border-t border-white/5 py-8 mt-8">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                                <span className="material-symbols-outlined text-white text-[16px]">school</span>
                            </div>
                            <span className="text-white font-bold text-sm">VocabMaster</span>
                        </div>
                        <p className="text-[#8b9bb4] text-xs leading-relaxed">AI destekli kelime öğrenme platformu.</p>
                    </div>
                    {session && (
                        <div>
                            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Platform</h4>
                            <div className="space-y-2 text-xs text-[#8b9bb4]">
                                <Link href="/categories" className="block hover:text-white transition-colors">Kelimeler</Link>
                                <Link href="/study/select" className="block hover:text-white transition-colors">Pratik</Link>
                                <Link href="/leaderboard" className="block hover:text-white transition-colors">Liderlik</Link>
                                <Link href="/achievements" className="block hover:text-white transition-colors">Başarımlar</Link>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Şirket</h4>
                        <div className="space-y-2 text-xs text-[#8b9bb4]">
                            <Link href="/about" className="block hover:text-white transition-colors">Hakkımızda</Link>
                            <Link href="/pricing" className="block hover:text-white transition-colors">Fiyatlandırma</Link>
                            <Link href="/contact" className="block hover:text-white transition-colors">İletişim</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Yasal</h4>
                        <div className="space-y-2 text-xs text-[#8b9bb4]">
                            <Link href="/privacy" className="block hover:text-white transition-colors">Gizlilik Politikası</Link>
                            <Link href="/terms" className="block hover:text-white transition-colors">Kullanım Koşulları</Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-[#8b9bb4] text-xs">
                        © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span> — Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    );
}
