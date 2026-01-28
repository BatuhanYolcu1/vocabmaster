'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Loader2, Camera, Image as ImageIcon, Wand2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedWord {
    word: string;
    translation: string;
    example?: string;
}

export default function ImportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
    const [listName, setListName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const processImage = async (imageFile: File) => {
        setExtracting(true);
        setError('');

        try {
            // Convert to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(imageFile);
            });
            const base64Image = await base64Promise;

            const res = await fetch('/api/ai/extract-words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            if (res.ok) {
                const data = await res.json();
                setParsedWords(data);
                setListName(`AI List - ${new Date().toLocaleDateString('tr-TR')}`);
            } else {
                setError('Resimdeki kelimeler ayıklanamadı. Lütfen resmin net olduğundan emin olun.');
            }
        } catch (err) {
            console.error(err);
            setError('AI servisine bağlanırken bir hata oluştu.');
        } finally {
            setExtracting(false);
        }
    };

    const parseFile = useCallback(async (file: File) => {
        setError('');
        setParsedWords([]);
        setPreviewUrl(null);

        const extension = file.name.split('.').pop()?.toLowerCase();

        // Handle Images
        if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            await processImage(file);
            return;
        }

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

                // Skip header if first row looks like a header
                if (words.length > 0 && (words[0].word.toLowerCase() === 'word' || words[0].word.toLowerCase() === 'kelime')) {
                    words.shift();
                }

                setParsedWords(words);
                setListName(file.name.replace(/\.(csv|txt)$/i, ''));
            } else {
                setError('Desteklenmeyen dosya formatı. Lütfen .xlsx, .csv, .txt veya resim dosyası yükleyin.');
            }
        } catch {
            setError('Dosya okunamadı. Lütfen dosya formatını kontrol edin.');
        }
    }, [processImage]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            parseFile(droppedFile);
        }
    }, [parseFile]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    }, [parseFile]);

    const handleImport = async () => {
        if (!listName.trim()) {
            setError('Lütfen liste adı girin.');
            return;
        }

        if (parsedWords.length === 0) {
            setError('İçe aktarılacak kelime yok.');
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
                    description: `${parsedWords.length} kelime içe aktarıldı`,
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
                setError('İçe aktarma sırasında bir hata oluştu.');
            }
        } catch {
            setError('Sunucu hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/categories"
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-7 h-7 text-emerald-500" />
                        Magic Import
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Excel veya CSV dosyasından kelime içe aktar</p>
                </div>
            </div>

            {success ? (
                <div className="text-center py-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                        Başarıyla İçe Aktarıldı!
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-500">
                        {parsedWords.length} kelime eklendi. Yönlendiriliyorsunuz...
                    </p>
                </div>
            ) : (
                <>
                    {/* File Upload */}
                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${dragActive
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-2xl scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/5'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {previewUrl ? (
                            <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-white/10 shadow-2xl mb-6 group">
                                <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover max-h-64" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white text-black px-4 py-2 rounded-xl font-bold text-sm shadow-xl"
                                    >
                                        Değiştir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Upload className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-6 animate-bounce" />
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,.txt,image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="space-y-2">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {file ? file.name : 'Dosyayı buraya bırakın veya tıklayın'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Excel, CSV or <span className="text-indigo-500 font-bold">Resim (Kitap Sayfası)</span>
                            </p>
                        </div>
                    </div>

                    {/* AI Processing State */}
                    {extracting && (
                        <div className="mt-6 p-10 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-1 bg-indigo-500 animate-[loading_2s_infinite]" />
                            <Wand2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-lg font-bold text-indigo-400 mb-2">Magic AI Metin Ayıklıyor...</h3>
                            <p className="text-sm text-indigo-300/80">Gemini sayfadaki kelimleri ve anlamları senin için analiz ediyor, lütfen bekle.</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Preview Table */}
                    {parsedWords.length > 0 && !extracting && (
                        <div className="mt-8 space-y-6 animate-fadeIn">
                            <div className="relative group">
                                <label className="absolute -top-3 left-4 px-2 bg-[#0a0d14] text-xs font-bold text-indigo-400 tracking-widest uppercase z-10 transition-colors group-focus-within:text-cyan-400">
                                    Liste Adı
                                </label>
                                <input
                                    type="text"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg font-medium"
                                    placeholder="Yeni Koleksiyon İsmi"
                                />
                            </div>

                            <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden shadow-2xl">
                                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Wand2 className="w-4 h-4 text-indigo-400" />
                                        Önizleme ({parsedWords.length} kelime)
                                    </h3>
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">AI Tarafından Ayıklandı</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 bg-[#0a0d14] text-left text-[10px] uppercase tracking-wider text-slate-500">
                                            <tr>
                                                <th className="px-6 py-3 font-bold">İngilizce</th>
                                                <th className="px-6 py-3 font-bold">Türkçe</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {parsedWords.map((word, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="text-white font-medium">{word.word}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{word.translation}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] text-white font-black text-lg rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        İçeriye Aktarılıyor...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-6 h-6" />
                                        Koleksiyonu Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Format Guide */}
                    {!parsedWords.length && !extracting && (
                        <div className="mt-12 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-xl">
                            <h4 className="font-black text-indigo-400 text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                AI Resim Rehberi
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <p className="text-white font-bold mb-1">📸 Net Fotoğraf</p>
                                    <p className="text-slate-500 leading-relaxed">Kelime ve anlamların net okunduğundan emin olun.</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <p className="text-white font-bold mb-1">↔️ Sütun Düzeni</p>
                                    <p className="text-slate-500 leading-relaxed">Liste formatındaki kitap sayfaları en iyi sonucu verir.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Guide */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">📋 Dosya Formatı</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Excel veya CSV dosyanızda şu sütunlar olmalı:
                        </p>
                        <div className="mt-2 font-mono text-xs bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700">
                            word, translation, example (opsiyonel)
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
