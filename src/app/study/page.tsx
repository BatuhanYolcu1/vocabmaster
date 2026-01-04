'use client';

import Link from 'next/link';

export default function StudyPage() {
    return (
        <div className="min-h-screen bg-[#0b0f17] text-white font-['Lexend'] relative flex items-center justify-center">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-lg px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(19,91,236,0.4)]">
                    <span className="material-symbols-outlined text-white text-4xl">school</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-4">Çalışmaya Hazır mısın?</h1>
                <p className="text-[#92a4c9] text-lg mb-8">
                    Birçok farklı çalışma modundan sana en uygun olanını seç ve öğrenmeye başla!
                </p>
                <Link
                    href="/study/modes"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all"
                >
                    <span className="material-symbols-outlined">play_circle</span>
                    Modları Keşfet
                </Link>
            </div>
        </div>
    );
}
