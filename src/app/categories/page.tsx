'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BookOpen, Briefcase, Plane, GraduationCap, Code, Heart, Plus, FolderOpen, FileSpreadsheet } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    nameTr: string;
    icon: React.ReactNode;
    color: string;
    wordCount: number;
}

const systemCategories: Category[] = [
    { id: 'genel', name: 'general', nameTr: 'Genel', icon: <BookOpen className="w-6 h-6" />, color: 'bg-indigo-500', wordCount: 0 },
    { id: 'is', name: 'business', nameTr: 'İş & Kariyer', icon: <Briefcase className="w-6 h-6" />, color: 'bg-emerald-500', wordCount: 0 },
    { id: 'seyahat', name: 'travel', nameTr: 'Seyahat', icon: <Plane className="w-6 h-6" />, color: 'bg-sky-500', wordCount: 0 },
    { id: 'akademik', name: 'academic', nameTr: 'Akademik', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-violet-500', wordCount: 0 },
    { id: 'teknoloji', name: 'technology', nameTr: 'Teknoloji', icon: <Code className="w-6 h-6" />, color: 'bg-orange-500', wordCount: 0 },
    { id: 'saglik', name: 'health', nameTr: 'Sağlık', icon: <Heart className="w-6 h-6" />, color: 'bg-rose-500', wordCount: 0 },
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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelime Kategorileri</h1>
                <p className="text-gray-600">Konulara göre kelime çalış veya kendi listelerini oluştur</p>
            </div>

            {/* System Categories */}
            <section className="mb-12">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Hazır Kategoriler</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/study?category=${category.nameTr}`}
                            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all"
                        >
                            <div className={`inline-flex p-3 rounded-xl ${category.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                                {category.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{category.nameTr}</h3>
                            <p className="text-sm text-gray-500">{category.wordCount} kelime</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* User's Word Lists */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Kişisel Listelerim</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/wordlists/import"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors font-medium text-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            İçe Aktar
                        </Link>
                        <Link
                            href="/wordlists/new"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Liste
                        </Link>
                    </div>
                </div>

                {!session ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                        <p className="text-gray-600 mb-4">Kendi kelime listelerini oluşturmak için giriş yap</p>
                        <Link
                            href="/auth/signin"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
                        ))}
                    </div>
                ) : wordLists.length === 0 ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-8 text-center border-2 border-dashed border-indigo-200">
                        <FolderOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Henüz liste oluşturmadın</p>
                        <Link
                            href="/wordlists/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            İlk Listeni Oluştur
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wordLists.map((list) => (
                            <Link
                                key={list.id}
                                href={`/wordlists/${list.id}`}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all"
                            >
                                <h3 className="font-semibold text-gray-900 mb-1">{list.name}</h3>
                                {list.description && (
                                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{list.description}</p>
                                )}
                                <p className="text-sm text-indigo-600 font-medium">{list.wordCount} kelime</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
