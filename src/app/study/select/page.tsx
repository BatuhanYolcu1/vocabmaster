'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Plus, AlertCircle } from 'lucide-react';

interface WordList {
  id: string;
  name: string;
  description: string;
  _count: { items: number };
}

const ModeIcons = {
  flashcard: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1.5-1.5 2-1.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  typing: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 10h1M8 10h1M11 10h2M16 10h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 13h2M8 13h1M11 13h2M15 13h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  matching: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <rect x="2" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="15" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="15" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 6.5h6M9 17.5h6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  ),
  listening: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M3 12a9 9 0 1118 0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12v5a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H3zM21 12v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  speaking: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M12 2a3.5 3.5 0 00-3.5 3.5v5a3.5 3.5 0 007 0v-5A3.5 3.5 0 0012 2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 10v.5a7 7 0 01-14 0V10M12 17.5V22M8 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'fill-blank': (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M4 19H20M5 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  story: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 19l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const studyModes = [
  { id: 'flashcard', name: 'Beyin Kartları', icon: 'flashcard', description: 'Çevir, düşün, hatırla', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'multiple-choice', name: 'Bilgi Yarışması', icon: 'quiz', description: '4 seçenek, 1 doğru cevap', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'typing', name: 'Parmak Hafızası', icon: 'typing', description: 'Yazarak kalıcı öğren', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { id: 'matching', name: 'Eşleştirme', icon: 'matching', description: 'İngilizce-Türkçe bağlantısını kur', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'listening', name: 'Dinleme', icon: 'listening', description: 'Dinle ve kelimeyi tanı', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { id: 'speaking', name: 'Konuşma', icon: 'speaking', description: 'Söyle ve telaffuzunu kontrol et', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 'fill-blank', name: 'Boşluk Doldur', icon: 'fill-blank', description: 'Cümledeki eksik kelimeyi yaz', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'story', name: 'Story Modu', icon: 'story', description: 'AI ile hikaye kurarak öğren', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

export default function StudySelectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [step, setStep] = useState<'list' | 'mode'>('list');

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    fetch('/api/wordlists')
      .then(r => r.ok ? r.json() : [])
      .then(data => setWordLists(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const handleModeSelect = (modeId: string) => {
    if (!selectedList) return;
    router.push(`/study/${modeId}?listId=${selectedList}`);
  };

  const selectedListData = wordLists.find(l => l.id === selectedList);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${step === 'list' ? 'bg-[#135bec]/15 border border-[#135bec]/30 text-[#135bec]' : 'text-[#6b7a94]'}`}>
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold text-inherit">1</span>
            Liste
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${step === 'mode' ? 'bg-[#135bec]/15 border border-[#135bec]/30 text-[#135bec]' : 'text-[#6b7a94]'}`}>
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold text-inherit">2</span>
            Mod
          </div>
        </div>

        {/* Step 1: List Selection */}
        {step === 'list' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1">Hangi listeden çalışmak istiyorsun?</h1>
              <p className="text-[#6b7a94] text-sm">Bir kelime listesi seç ve öğrenmeye başla</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin" />
              </div>
            ) : !session ? (
              <div className="max-w-sm mx-auto text-center py-16">
                <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={22} className="text-[#135bec]" />
                </div>
                <h3 className="font-semibold mb-2">Giriş yapman gerekiyor</h3>
                <p className="text-[#6b7a94] text-sm mb-6">Kelime listelerine erişmek için hesabına giriş yap</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors">
                  Giriş Yap
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : wordLists.length === 0 ? (
              <div className="max-w-sm mx-auto text-center py-16">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Plus size={22} className="text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">Henüz listeniz yok</h3>
                <p className="text-[#6b7a94] text-sm mb-6">Öğrenmeye başlamak için bir kelime listesi oluştur</p>
                <Link href="/wordlists/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors">
                  Liste Oluştur
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wordLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => { setSelectedList(list.id); setStep('mode'); }}
                    disabled={list._count?.items === 0}
                    className={`group p-5 rounded-xl border text-left transition-all ${
                      list._count?.items === 0
                        ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/2'
                        : 'border-white/8 bg-[#111827] hover:border-[#135bec]/40 hover:bg-[#111827]/80 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center">
                        <BookOpen size={16} className="text-[#135bec]" />
                      </div>
                      <span className="text-[11px] text-[#6b7a94] bg-white/5 px-2 py-0.5 rounded-md">
                        {list._count?.items ?? 0} kelime
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-[#135bec] transition-colors">
                      {list.name}
                    </h3>
                    <p className="text-xs text-[#6b7a94] line-clamp-2">
                      {list.description || 'Kişisel koleksiyon'}
                    </p>
                    {list._count?.items === 0 && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400/80">
                        <AlertCircle size={12} />
                        Kelime eklenmemiş
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Mode Selection */}
        {step === 'mode' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <button
                onClick={() => setStep('list')}
                className="flex items-center gap-2 text-[#6b7a94] hover:text-white transition-colors text-sm mb-4"
              >
                <ArrowLeft size={16} />
                Listeye dön
              </button>
              <h1 className="text-2xl font-bold mb-1">Çalışma modunu seç</h1>
              <p className="text-[#6b7a94] text-sm">
                <span className="text-white font-medium">{selectedListData?.name}</span> listesi için mod seç
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studyModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group p-5 rounded-xl border border-white/8 bg-[#111827] hover:border-white/20 hover:bg-[#111827]/80 text-left transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-lg ${mode.bg} border ${mode.border} flex items-center justify-center ${mode.color} shrink-0`}>
                      {ModeIcons[mode.icon as keyof typeof ModeIcons]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-0.5 group-hover:text-white transition-colors">
                        {mode.name}
                      </h3>
                      <p className="text-xs text-[#6b7a94]">{mode.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-[#6b7a94] group-hover:text-white transition-all translate-x-0 group-hover:translate-x-1 shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
