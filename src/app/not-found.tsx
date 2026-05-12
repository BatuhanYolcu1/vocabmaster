import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="relative mb-8">
                    <p className="text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#135bec]/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-[#135bec]">search_off</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                    Sayfa Bulunamadı
                </h1>
                <p className="text-[#8b9bb4] mb-8 leading-relaxed">
                    Aradığın sayfa mevcut değil veya taşınmış olabilir. Kelime öğrenmeye devam etmek için ana sayfaya dön!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfa
                    </Link>
                    <Link
                        href="/study/select"
                        className="px-8 py-3.5 rounded-xl glass-button text-white font-medium flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">play_circle</span>
                        Pratik Yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
