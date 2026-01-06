'use client';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 bg-[#0b0f17] flex items-center justify-center animate-fadeIn">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px] animate-pulse" />
            </div>

            <div className="relative z-10 text-center">
                {/* Animated Logo/Spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-[#135bec]/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#135bec] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                </div>

                {/* Loading Text */}
                <p className="text-[#8b9bb4] text-sm animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
}
