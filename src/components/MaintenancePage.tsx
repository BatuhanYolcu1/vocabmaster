'use client';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-[#0f172a] flex flex-col justify-center items-center relative overflow-hidden px-4">
            {/* Ambient Background Lighting */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/30 blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/20 blur-[110px] pointer-events-none" />
            
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }} />

            <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
                {/* Visual Gear Animation */}
                <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                    {/* Big Gear */}
                    <div className="absolute w-24 h-24 border-4 border-dashed border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '15s' }} />
                    <div className="absolute w-20 h-20 border border-cyan-500/20 rounded-full" />
                    
                    {/* Small Gear */}
                    <div className="absolute bottom-2 right-2 w-12 h-12 border-2 border-dashed border-purple-500/40 rounded-full animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                    
                    {/* Core Icon */}
                    <div className="absolute w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(6,182,212,0.3)]">
                        <span className="material-symbols-outlined text-white text-3xl animate-pulse">construction</span>
                    </div>
                </div>

                {/* Badges */}
                <span className="text-[10px] uppercase tracking-widest text-[#135bec] font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 mb-6">
                    SİSTEM GÜNCELLEMESİ
                </span>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0f172a] mb-6">
                    Kısa Bir Ara Verdik 🛠️
                </h1>
                
                {/* Description */}
                <p className="text-[#64748b] text-base md:text-lg font-semibold leading-relaxed mb-8">
                    Sizlere daha hızlı, stabil ve yapay zeka destekli mükemmel bir kelime öğrenme deneyimi sunmak için sistemimizi güncelliyoruz. Çok yakında buradayız!
                </p>

                {/* Progress bar simulation */}
                <div className="w-full bg-white border border-slate-200 rounded-full p-1.5 mb-10 max-w-sm shadow-sm">
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 h-2 rounded-full w-[80%] animate-pulse" />
                </div>

                {/* Footer Info */}
                <p className="text-xs text-slate-400">
                    Acil durumlar veya destek için: <a href="mailto:support@vocabmaster.app" className="text-[#135bec] hover:underline font-bold">support@vocabmaster.app</a>
                </p>
            </div>
        </div>
    );
}
