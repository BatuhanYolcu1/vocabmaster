'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Footer() {
    const { data: session } = useSession();

    return (
        <footer className="relative z-10 border-t border-white/5 py-6 mt-8">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#135bec] to-purple-600">
                            <span className="material-symbols-outlined text-white text-[16px]">school</span>
                        </div>
                        <span className="text-white font-bold text-sm">VocabMaster</span>
                    </div>
                    {session && (
                        <div className="flex items-center gap-6 text-xs text-[#8b9bb4]">
                            <Link href="/categories" className="hover:text-white transition-colors">Kelimeler</Link>
                            <Link href="/study/select" className="hover:text-white transition-colors">Pratik</Link>
                            <Link href="/leaderboard" className="hover:text-white transition-colors">Liderlik</Link>
                            <Link href="/achievements" className="hover:text-white transition-colors">Başarımlar</Link>
                        </div>
                    )}
                    <div className="text-center md:text-right">
                        <p className="text-[#8b9bb4] text-xs">
                            © {new Date().getFullYear()} <span className="font-medium text-[#135bec]">BAY Technology</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
