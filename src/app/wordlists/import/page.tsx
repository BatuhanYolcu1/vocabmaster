'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedWord {
    word: string;
    translation: string;
    example?: string;
}

export default function ImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
    const [listName, setListName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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

                // Skip header if first row looks like a header
                if (words.length > 0 && (words[0].word.toLowerCase() === 'word' || words[0].word.toLowerCase() === 'kelime')) {
                    words.shift();
                }

                setParsedWords(words);
                setListName(file.name.replace(/\.(csv|txt)$/i, ''));
            } else {
                setError('Desteklenmeyen dosya formatı. Lütfen .xlsx, .csv veya .txt dosyası yükleyin.');
            }
        } catch {
            setError('Dosya okunamadı. Lütfen dosya formatını kontrol edin.');
        }
    }, []);

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
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Dosyayı buraya sürükleyin veya tıklayın
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            .xlsx, .csv veya .txt desteklenir
                        </p>
                        {file && (
                            <p className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium">
                                📄 {file.name}
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Preview */}
                    {parsedWords.length > 0 && (
                        <div className="mt-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Liste Adı
                                </label>
                                <input
                                    type="text"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Yeni Liste"
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Önizleme ({parsedWords.length} kelime)
                                </h3>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {parsedWords.slice(0, 20).map((word, i) => (
                                        <div key={i} className="flex items-center gap-4 p-2 bg-white dark:bg-slate-700 rounded-lg text-sm">
                                            <span className="font-medium text-gray-900 dark:text-white">{word.word}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="text-gray-600 dark:text-gray-300">{word.translation}</span>
                                        </div>
                                    ))}
                                    {parsedWords.length > 20 && (
                                        <p className="text-center text-gray-400 text-sm py-2">
                                            +{parsedWords.length - 20} kelime daha...
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        İçe Aktarılıyor...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {parsedWords.length} Kelimeyi İçe Aktar
                                    </>
                                )}
                            </button>
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
