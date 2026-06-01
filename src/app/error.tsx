'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Bir Sorun Oluştu</h1>
        <p className="text-[#6b7a94] mb-8 leading-relaxed text-sm">
          Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen bizimle iletişime geçin.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors"
          >
            <RefreshCw size={15} />
            Tekrar Dene
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/6 border border-white/8 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Home size={15} />
            Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  );
}
