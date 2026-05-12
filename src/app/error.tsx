'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto mb-8">
                    <span className="material-symbols-outlined text-5xl text-orange-400">warning</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                    Bir Sorun Oluştu
                </h1>
                <p className="text-[#8b9bb4] mb-8 leading-relaxed">
                    Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen bizimle iletişime geçin.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Tekrar Dene
                    </button>
                    <a
                        href="/"
                        className="px-8 py-3.5 rounded-xl glass-button text-white font-medium flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfa
                    </a>
                </div>
            </div>
        </div>
    );
}
