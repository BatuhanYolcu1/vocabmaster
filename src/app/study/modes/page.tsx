'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

const studyModes = [
    {
        id: 'flashcard',
        title: 'Flashcard',
        description: 'Klasik kart yöntemiyle kelimeleri hızlıca tekrar et ve hafızanı tazele.',
        icon: 'style',
        gradient: 'from-blue-500 to-blue-700',
        glowColor: 'bg-blue-500',
        tag: 'Popüler',
        tagColor: 'text-blue-400 bg-blue-400/10',
        href: '/study/flashcard'
    },
    {
        id: 'multiple-choice',
        title: 'Çoktan Seçmeli',
        description: 'Doğru cevabı şıklar arasından bul ve hızlı düşünme yeteneğini geliştir.',
        icon: 'quiz',
        gradient: 'from-purple-500 to-purple-700',
        glowColor: 'bg-purple-500',
        tag: 'Hızlı',
        tagColor: 'text-purple-400 bg-purple-400/10',
        href: '/study/multiple-choice'
    },
    {
        id: 'typing',
        title: 'Yazarak Cevapla',
        description: 'Kelimenin yazılışını pratik yap, harf hatalarını ortadan kaldır.',
        icon: 'edit_note',
        gradient: 'from-pink-500 to-pink-700',
        glowColor: 'bg-pink-500',
        tag: 'Zor',
        tagColor: 'text-pink-400 bg-pink-400/10',
        href: '/study/typing'
    },
    {
        id: 'matching',
        title: 'Eşleştirme',
        description: 'Kelimeleri anlamlarıyla eşleştir, bağlantıları görsel olarak kur.',
        icon: 'join_inner',
        gradient: 'from-green-500 to-green-700',
        glowColor: 'bg-green-500',
        tag: 'Eğlenceli',
        tagColor: 'text-green-400 bg-green-400/10',
        href: '/study/matching'
    },
    {
        id: 'listening',
        title: 'Dinleme',
        description: 'Telaffuzu dikkatlice dinle ve kelimeyi anlamlandırarak yaz.',
        icon: 'headphones',
        gradient: 'from-amber-500 to-amber-700',
        glowColor: 'bg-amber-500',
        tag: 'İşitsel',
        tagColor: 'text-amber-400 bg-amber-400/10',
        href: '/study/listening'
    },
    {
        id: 'speaking',
        title: 'Konuşma Koçu',
        description: 'Yapay zeka ile telaffuzunu geliştir, anında geri bildirim al.',
        icon: 'mic',
        gradient: 'from-red-500 to-red-700',
        glowColor: 'bg-red-500',
        tag: 'İnteraktif',
        tagColor: 'text-red-400 bg-red-400/10',
        href: '/study/speaking',
        isAI: true
    }
];

export default function StudyModesPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-[#101622] text-white font-['Lexend'] relative overflow-x-hidden">
            {/* Ambient Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-60 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(19, 91, 236, 0.4) 0%, rgba(19, 91, 236, 0) 70%)' }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[80px] opacity-50 animate-float-delayed"
                    style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 70%)' }}
                />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-col">
                {/* Main Content */}
                <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-8">
                    <div className="w-full max-w-[1000px] flex flex-col gap-10">
                        {/* Page Heading & Stats Summary */}
                        <div className="flex flex-col gap-6 text-center md:text-left md:flex-row md:items-end md:justify-between">
                            <div className="flex flex-col gap-2">
                                <span className="text-[#135bec] font-bold text-sm tracking-widest uppercase">Öğrenme Merkezi</span>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                    Çalışma Modu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#135bec]">Seçimi</span>
                                </h2>
                                <p className="text-[#92a4c9] text-lg font-light max-w-lg">
                                    Bugün hangi yöntemle kelime hazineni geliştirmek istersiniz?
                                </p>
                            </div>
                            {/* Mini Stats Widget */}
                            <div className="glass-panel p-4 rounded-xl flex items-center gap-6 mt-4 md:mt-0 self-center md:self-end hover:bg-white/5 transition-all cursor-default">
                                <div className="text-center">
                                    <p className="text-xs text-[#92a4c9] uppercase font-semibold">Hedef</p>
                                    <p className="text-white font-bold text-xl">50/100</p>
                                </div>
                                <div className="h-8 w-[1px] bg-white/10" />
                                <div className="text-center">
                                    <p className="text-xs text-[#92a4c9] uppercase font-semibold">Seviye</p>
                                    <p className="text-white font-bold text-xl">B2</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid of Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studyModes.map((mode) => (
                                <Link
                                    key={mode.id}
                                    href={mode.href}
                                    className="group glass-card relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(19,91,236,0.2)] hover:border-[#135bec]/40 cursor-pointer"
                                >
                                    <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${mode.glowColor}/20 blur-[50px] transition-all group-hover:${mode.glowColor}/30`} />
                                    <div className="relative z-10 flex flex-col h-full gap-4">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{mode.title}</h3>
                                                {mode.isAI && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-black">AI</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed font-light">{mode.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                            <span className={`text-xs font-medium ${mode.tagColor} px-2 py-1 rounded-md`}>{mode.tag}</span>
                                            <span className="material-symbols-outlined text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 mt-auto w-full border-t border-white/5 bg-[#111722]/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-10">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-2xl">school</span>
                                <span className="text-lg font-bold">VocabMaster</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                <a className="text-sm font-medium text-[#92a4c9] hover:text-white transition-colors" href="#">Gizlilik Politikası</a>
                                <a className="text-sm font-medium text-[#92a4c9] hover:text-white transition-colors" href="#">Kullanım Koşulları</a>
                                <a className="text-sm font-medium text-[#92a4c9] hover:text-white transition-colors" href="#">Yardım</a>
                            </div>
                            <div className="flex gap-4">
                                <a className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#92a4c9] hover:bg-[#135bec] hover:text-white transition-all" href="#">
                                    <span className="text-sm">X</span>
                                </a>
                                <a className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#92a4c9] hover:bg-pink-600 hover:text-white transition-all" href="#">
                                    <span className="text-sm">Ig</span>
                                </a>
                                <a className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#92a4c9] hover:bg-[#5865F2] hover:text-white transition-all" href="#">
                                    <span className="text-sm">Dc</span>
                                </a>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-[#92a4c9] font-light">© 2024 VocabMaster. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
