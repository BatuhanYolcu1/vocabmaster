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
        <div className="min-h-screen bg-slate-50 text-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/30 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-100/30 blur-[110px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-50 to-red-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-orange-500">warning</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#0f172a]">
                    Bir Sorun Oluştu
                </h1>
                <p className="text-[#64748b] mb-8 leading-relaxed font-semibold">
                    Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen bizimle iletişime geçin.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-[0_10px_20px_-5px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <span className="material-symbols-outlined text-base">refresh</span>
                        Tekrar Dene
                    </button>
                    <a
                        href="/"
                        className="px-8 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-base">home</span>
                        Ana Sayfa
                    </a>
                </div>
            </div>
        </div>
    );
}
