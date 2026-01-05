'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    wordCount: number;
    previewWords: { word: string; translation: string }[];
}

export default function TemplatesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch('/api/wordlists/templates');
                if (res.ok) {
                    const data = await res.json();
                    setTemplates(data);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    const copyToAccount = async (templateId: string, templateName: string) => {
        setCopying(templateId);
        try {
            const res = await fetch('/api/wordlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ copyFromTemplate: templateId })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/wordlists/${data.id}`);
            } else {
                alert('Liste kopyalanırken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error copying template:', error);
            alert('Bir hata oluştu.');
        } finally {
            setCopying(null);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Sınav': return 'school';
            case 'Günlük': return 'chat';
            case 'Seyahat': return 'flight';
            default: return 'list';
        }
    };

    const getCategoryGradient = (category: string) => {
        switch (category) {
            case 'Sınav': return 'from-blue-500 to-indigo-600';
            case 'Günlük': return 'from-green-500 to-emerald-600';
            case 'Seyahat': return 'from-orange-500 to-red-500';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#135bec] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none z-0" />

            <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-10 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/categories" className="text-[#8b9bb4] hover:text-white transition-colors flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Geri
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] to-purple-400">📚 Hazır Kelime Listeleri</span>
                    </h1>
                    <p className="text-[#8b9bb4] text-lg">
                        Uzman seçimi listelerle hemen öğrenmeye başla
                    </p>
                </div>

                {/* Templates Grid */}
                {templates.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-[#8b9bb4] mb-4">inventory_2</span>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz hazır liste yok</h3>
                        <p className="text-[#8b9bb4]">Yakında eklenecek!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:bg-[#232f48]/60 transition-all duration-300"
                            >
                                {/* Background Glow */}
                                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${getCategoryGradient(template.category)} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-all`} />

                                {/* Category Icon */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryGradient(template.category)} flex items-center justify-center mb-4 shadow-lg`}>
                                    <span className="material-symbols-outlined text-white text-2xl">{getCategoryIcon(template.category)}</span>
                                </div>

                                {/* Info */}
                                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                                <p className="text-[#8b9bb4] text-sm mb-4 line-clamp-2">{template.description}</p>

                                {/* Word Count */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-[#135bec]/20 text-[#135bec] text-sm font-medium border border-[#135bec]/30">
                                        {template.wordCount} kelime
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-[#8b9bb4] text-sm border border-white/10">
                                        {template.category}
                                    </span>
                                </div>

                                {/* Preview Words */}
                                <div className="space-y-2 mb-6">
                                    <p className="text-xs text-[#8b9bb4] uppercase tracking-wider font-medium">Örnek Kelimeler:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {template.previewWords.slice(0, 4).map((word, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 text-white text-xs">
                                                {word.word}
                                            </span>
                                        ))}
                                        {template.wordCount > 4 && (
                                            <span className="px-2 py-1 rounded-lg bg-white/5 text-[#8b9bb4] text-xs">
                                                +{template.wordCount - 4} daha
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={() => copyToAccount(template.id, template.name)}
                                    disabled={copying === template.id}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(19,91,236,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {copying === template.id ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Ekleniyor...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">add_circle</span>
                                            Listeme Ekle
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
