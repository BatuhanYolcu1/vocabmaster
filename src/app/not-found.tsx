import Link from 'next/link';
import { SearchX, Home, Play } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-white/8 leading-none select-none mb-8">404</p>
        <div className="w-16 h-16 rounded-xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center mx-auto mb-6">
          <SearchX size={28} className="text-[#135bec]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Sayfa Bulunamadı</h1>
        <p className="text-[#6b7a94] mb-8 text-sm leading-relaxed">
          Aradığın sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors"
          >
            <Home size={15} />
            Ana Sayfa
          </Link>
          <Link
            href="/study/select"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/6 border border-white/8 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Play size={15} />
            Çalış
          </Link>
        </div>
      </div>
    </div>
  );
}
