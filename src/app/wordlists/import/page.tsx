'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Loader2, Wand2, Type } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedWord {
    word: string;
    translation: string;
    example?: string;
}

export default function ImportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importMode, setImportMode] = useState<'file' | 'text'>('file');
    const [rawText, setRawText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
    const [listName, setListName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [hasExcelImport, setHasExcelImport] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkSubscription() {
            try {
                const res = await fetch('/api/subscription');
                if (res.ok) {
                    const data = await res.json();
                    setHasExcelImport(data.limits?.hasExcelImport ?? false);
                } else {
                    setHasExcelImport(false);
                }
            } catch {
                setHasExcelImport(false);
            }
        }
        checkSubscription();
    }, []);

    const handleMagicExtract = async () => {
        if (!rawText.trim()) return;
        setExtracting(true);
        setError('');
        try {
            const res = await fetch('/api/ai/magic-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawText })
            });

            if (res.ok) {
                const data = await res.json();
                setParsedWords(data);
                setListName(`Sihirli Liste - ${new Date().toLocaleDateString('tr-TR')}`);
            } else {
                const errorText = await res.text();
                setError(`Analiz hatası: ${errorText}`);
            }
        } catch (err) {
            setError('AI servisine bağlanılamadı.');
        } finally {
            setExtracting(false);
        }
    };

    const parseFile = useCallback(async (file: File) => {
        setError('');
        setParsedWords([]);

        const extension = file.name.split('.').pop()?.toLowerCase();

        try {
            if (extension === 'xlsx' || extension === 'xls') {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

                const words: ParsedWord[] = data.map(row => ({
                    word: row['word'] || row['kelime'] || row['Word'] || row['Kelime'] || Object.values(row)[0] || '',
                    translation: row['translation'] || row['çeviri'] || row['Translation'] || row['Çeviri'] || row['anlam'] || Object.values(row)[1] || '',
                    example: row['example'] || row['örnek'] || row['Example'] || row['Örnek'] || '',
                })).filter(w => w.word && w.translation);

                setParsedWords(words);
                setListName(file.name.replace(/\.(xlsx|xls|csv|txt)$/i, ''));

            } else if (extension === 'csv' || extension === 'txt') {
                const text = await file.text();
                const lines = text.split('\n').filter(line => line.trim());

                const words: ParsedWord[] = lines.map(line => {
                    const parts = line.split(/[,;\t]/).map(p => p.trim());
                    return {
                        word: parts[0] || '',
                        translation: parts[1] || '',
                        example: parts[2] || '',
                    };
                }).filter(w => w.word && w.translation);

                if (words.length > 0 && (words[0].word.toLowerCase() === 'word' || words[0].word.toLowerCase() === 'kelime')) {
                    words.shift();
                }

                setParsedWords(words);
                setListName(file.name.replace(/\.(csv|txt)$/i, ''));
            } else {
                setError('Geçersiz dosya formatı.');
            }
        } catch {
            setError('Dosya okunamadı.');
        }
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            parseFile(e.dataTransfer.files[0]);
        }
    }, [parseFile]);

    const handleImport = async () => {
        if (!listName.trim() || parsedWords.length === 0) {
            setError('Geçerli bir isim ve en az bir kelime gereklidir.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/wordlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: listName,
                    description: `${parsedWords.length} kelime Magic Import ile eklendi`,
                    words: parsedWords.map(w => ({
                        word: w.word,
                        turkishTranslation: w.translation,
                        exampleSentence: w.example || '',
                    })),
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/categories');
                }, 1500);
            } else {
                setError('Kaydetme sırasında bir hata oluştu.');
            }
        } catch {
            setError('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    if (hasExcelImport === null) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/categories" className="p-2 rounded-xl glass-button text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Wand2 className="w-7 h-7 text-[#135bec]" />
                        Magic Import
                    </h1>
                    <p className="text-slate-500">Kopyaladığın metni veya dosyanı yükle</p>
                </div>
            </div>

            {success ? (
                <div className="glass-panel p-12 text-center rounded-3xl border border-emerald-500/20">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Başarıyla Eklendi!</h3>
                    <p className="text-slate-400">Yönlendiriliyorsunuz...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => { setImportMode('file'); setParsedWords([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${importMode === 'file' ? 'bg-[#135bec] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Dosya Yükle
                        </button>
                        <button
                            onClick={() => { setImportMode('text'); setParsedWords([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${importMode === 'text' ? 'bg-[#135bec] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Type className="w-4 h-4" />
                            Metin Yapıştır
                        </button>
                    </div>

                    {importMode === 'file' ? (
                        <div className="relative">
                            <div
                                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${dragActive ? 'border-[#135bec] bg-[#135bec]/5' : 'border-white/10 bg-white/5 hover:border-[#135bec]/50'}`}
                                onDragEnter={hasExcelImport ? handleDrag : undefined}
                                onDragLeave={hasExcelImport ? handleDrag : undefined}
                                onDragOver={hasExcelImport ? handleDrag : undefined}
                                onDrop={hasExcelImport ? handleDrop : undefined}
                            >
                                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                {hasExcelImport && (
                                    <input
                                        ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.txt"
                                        onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); parseFile(e.target.files[0]); } }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                )}
                                <p className="text-white font-bold">{file ? file.name : 'Dosya sürükle veya tıkla'}</p>
                                <p className="text-xs text-slate-500 mt-2">Excel, CSV veya TXT</p>
                            </div>

                            {!hasExcelImport && (
                                <div className="absolute inset-0 backdrop-blur-md bg-black/60 rounded-3xl flex flex-col items-center justify-center p-6 border border-white/5 animate-fadeIn">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                        <span className="material-symbols-outlined text-white text-xl">lock</span>
                                    </div>
                                    <h3 className="text-white font-bold text-base mb-1">Dosya Yükleme Premium Özelliktir</h3>
                                    <p className="text-[#8b9bb4] text-xs text-center max-w-sm mb-4 leading-relaxed">
                                        Kelime listelerinizi Excel, CSV veya TXT dosyalarından otomatik içe aktarmak için Lite veya Pro plana yükseltin.
                                    </p>
                                    <Link href="/pricing" className="px-5 py-2.5 bg-[#135bec] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                                        Planları İncele
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="glass-panel p-1 rounded-3xl overflow-hidden focus-within:ring-2 ring-[#135bec]/50 transition-all">
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="Buraya karman çorman bir metin veya Google Lens'ten kopyaladığın kelimeleri yapıştırabilirsin..."
                                    className="w-full h-40 p-6 bg-transparent text-white placeholder:text-slate-600 focus:outline-none resize-none"
                                />
                            </div>
                            <button
                                onClick={handleMagicExtract}
                                disabled={!rawText.trim() || extracting}
                                className="w-full py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                AI ile Kelimeleri Ayıkla
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {parsedWords.length > 0 && (
                        <div className="space-y-6 pt-4 animate-fadeIn">
                            <input
                                type="text"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                placeholder="Liste Adı"
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-[#135bec]/50"
                            />
                            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-black">İngilizce</th>
                                            <th className="px-6 py-4 font-black">Türkçe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {parsedWords.map((w, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{w.word}</td>
                                                <td className="px-6 py-4 text-slate-400">{w.translation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                onClick={handleImport}
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                                Koleksiyonu Kaydet ({parsedWords.length} Kelime)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
