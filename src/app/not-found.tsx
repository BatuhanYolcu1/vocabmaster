import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 text-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-100/30 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/30 blur-[110px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="relative mb-8">
                    <p className="text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-300/40 to-slate-200/20 leading-none select-none">
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#135bec]/10 to-purple-500/10 backdrop-blur-sm border border-slate-200/60 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-5xl text-[#135bec]">search_off</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#0f172a]">
                    Sayfa Bulunamadı
                </h1>
                <p className="text-[#64748b] mb-8 leading-relaxed font-medium">
                    Aradığın sayfa mevcut değil veya taşınmış olabilir. Kelime öğrenmeye devam etmek için ana sayfaya dön!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_10px_20px_-5px_rgba(19,91,236,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(19,91,236,0.4)] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <span className="material-symbols-outlined text-base">home</span>
                        Ana Sayfa
                    </Link>
                    <Link
                        href="/study/select"
                        className="px-8 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-base">play_circle</span>
                        Pratik Yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
