'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    BookOpen,
    Briefcase,
    Plane,
    GraduationCap,
    Code,
    Heart,
    Plus,
    FolderOpen,
    FileSpreadsheet,
    ChevronRight,
    Sparkles,
    ArrowRight,
    Library,
    Clock
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    nameTr: string;
    icon: React.ReactNode;
    gradient: string;
    shadowColor: string;
    wordCount: number;
}

const systemCategories: Category[] = [
    { id: 'genel', name: 'general', nameTr: 'Genel', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-indigo-500 to-violet-600', shadowColor: 'shadow-indigo-500/25', wordCount: 0 },
    { id: 'is', name: 'business', nameTr: 'İş & Kariyer', icon: <Briefcase className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600', shadowColor: 'shadow-emerald-500/25', wordCount: 0 },
    { id: 'seyahat', name: 'travel', nameTr: 'Seyahat', icon: <Plane className="w-6 h-6" />, gradient: 'from-sky-500 to-blue-600', shadowColor: 'shadow-sky-500/25', wordCount: 0 },
    { id: 'akademik', name: 'academic', nameTr: 'Akademik', icon: <GraduationCap className="w-6 h-6" />, gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/25', wordCount: 0 },
    { id: 'teknoloji', name: 'technology', nameTr: 'Teknoloji', icon: <Code className="w-6 h-6" />, gradient: 'from-orange-500 to-amber-600', shadowColor: 'shadow-orange-500/25', wordCount: 0 },
    { id: 'saglik', name: 'health', nameTr: 'Sağlık', icon: <Heart className="w-6 h-6" />, gradient: 'from-rose-500 to-pink-600', shadowColor: 'shadow-rose-500/25', wordCount: 0 },
];

interface WordList {
    id: string;
    name: string;
    description?: string;
    wordCount: number;
    createdAt: string;
}

export default function CategoriesPage() {
    const { data: session } = useSession();
    const [categories, setCategories] = useState<Category[]>(systemCategories);
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch category counts
                const catRes = await fetch('/api/words/categories');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(prev => prev.map(cat => ({
                        ...cat,
                        wordCount: catData[cat.nameTr] || 0
                    })));
                }

                // Fetch user's word lists
                if (session?.user?.id) {
                    const listRes = await fetch('/api/wordlists');
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        setWordLists(listData);
                    }
                }
            } catch {
                // Ignore errors for now
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [session]);

    const totalWords = wordLists.reduce((sum, list) => sum + list.wordCount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-500/25">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Library className="w-6 h-6" />
                                </div>
                                <span className="text-emerald-100 text-sm font-medium">Kelime Kütüphanesi</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold">
                                Kelime Kategorileri 📚
                            </h1>
                            <p className="text-emerald-100 text-lg max-w-xl">
                                Konulara göre kelime çalış veya kendi listelerini oluştur
                            </p>
                        </div>

                        {session && (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/wordlists/import"
                                    className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    <span>İçe Aktar</span>
                                </Link>
                                <Link
                                    href="/wordlists/new"
                                    className="group flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Yeni Liste</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Stats Bar */}
                    {session && wordLists.length > 0 && (
                        <div className="relative mt-6 pt-6 border-t border-white/20 flex items-center gap-8">
                            <div>
                                <p className="text-3xl font-bold">{wordLists.length}</p>
                                <p className="text-emerald-200 text-sm">Listem</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div>
                                <p className="text-3xl font-bold">{totalWords}</p>
                                <p className="text-emerald-200 text-sm">Toplam Kelime</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* System Categories */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hazır Kategoriler</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/study?category=${category.nameTr}`}
                                className="group relative overflow-hidden bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                                <div className="relative">
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${category.gradient} text-white mb-4 shadow-lg ${category.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                        {category.icon}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{category.nameTr}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{category.wordCount} kelime</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* User's Word Lists */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                                <FolderOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kişisel Listelerim</h2>
                        </div>
                    </div>

                    {!session ? (
                        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white text-center shadow-2xl shadow-violet-500/25 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <FolderOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Kendi Listelerini Oluştur</h3>
                                <p className="text-violet-200 mb-6 max-w-md mx-auto">
                                    Öğrenmek istediğin kelimeleri ekle ve kişiselleştirilmiş çalışma deneyimi yaşa
                                </p>
                                <Link
                                    href="/auth/signin"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-all shadow-lg"
                                >
                                    <span>Giriş Yap</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-32 animate-pulse" />
                            ))}
                        </div>
                    ) : wordLists.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center">
                                <FolderOpen className="w-10 h-10 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Henüz liste oluşturmadın</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                İlk kelime listeni oluştur ve öğrenmeye başla!
                            </p>
                            <Link
                                href="/wordlists/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25"
                            >
                                <Plus className="w-5 h-5" />
                                <span>İlk Listeni Oluştur</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {wordLists.map((list, index) => (
                                <Link
                                    key={list.id}
                                    href={`/wordlists/${list.id}`}
                                    className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-600 transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${index % 4 === 0 ? 'from-indigo-400 to-violet-500' :
                                                        index % 4 === 1 ? 'from-emerald-400 to-teal-500' :
                                                            index % 4 === 2 ? 'from-amber-400 to-orange-500' :
                                                                'from-rose-400 to-pink-500'
                                                    } flex items-center justify-center text-white shadow-lg`}>
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{list.name}</h3>
                                            </div>
                                            {list.description && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1 pl-13">{list.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                                                    <BookOpen className="w-4 h-4" />
                                                    {list.wordCount} kelime
                                                </span>
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(list.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
