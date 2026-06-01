'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Check, Zap, Brain, BarChart3, RefreshCw,
  BookOpen, Mic, Headphones, FileEdit, HelpCircle, Target,
  Flame, Star, Trophy, ChevronDown, PlayCircle,
} from 'lucide-react';

const demoWords = [
  { word: 'Resilient', tr: 'Dayanıklı', ipa: '/rɪˈzɪl.jənt/', level: 'B2', sentence: 'She is a resilient person who overcomes every challenge.' },
  { word: 'Eloquent', tr: 'Etkili konuşan', ipa: '/ˈel.ə.kwənt/', level: 'C1', sentence: 'His speech was eloquent and deeply moved the audience.' },
  { word: 'Perseverance', tr: 'Azim, kararlılık', ipa: '/ˌpɜː.sɪˈvɪə.rəns/', level: 'B2', sentence: 'Through perseverance, she finally achieved fluency.' },
];

const studyModes = [
  { icon: BookOpen, name: 'Flashcard', desc: 'Çevir & değerlendir', color: 'text-blue-400' },
  { icon: HelpCircle, name: 'Quiz', desc: '4 seçenekli test', color: 'text-emerald-400' },
  { icon: FileEdit, name: 'Yazarak', desc: 'Aktif hatırlama', color: 'text-violet-400' },
  { icon: Target, name: 'Eşleştirme', desc: 'Bağlantı kur', color: 'text-amber-400' },
  { icon: Headphones, name: 'Dinleme', desc: 'Telaffuzu tanı', color: 'text-sky-400' },
  { icon: Mic, name: 'Konuşma', desc: 'AI değerlendirme', color: 'text-rose-400' },
  { icon: FileEdit, name: 'Boşluk Doldur', desc: 'Bağlam içinde öğren', color: 'text-indigo-400' },
  { icon: Brain, name: 'Story Modu', desc: 'AI hikaye üretimi', color: 'text-purple-400' },
];

const features = [
  {
    icon: Brain,
    title: 'SRS — Akıllı Tekrar',
    desc: 'Unutma eğrisine göre en doğru zamanda tekrar. Duolingo\'nun aksine bilimsel tabanlı algoritma.',
    highlight: true,
  },
  {
    icon: Zap,
    title: '8 Çalışma Modu',
    desc: 'Flashcard\'dan Speaking\'e, Quiz\'den Story\'ye. Her öğrenme stiline uygun mod.',
    highlight: false,
  },
  {
    icon: BarChart3,
    title: 'Detaylı İstatistikler',
    desc: 'Hangi kelimelerin zorlandığını, öğrenme hızını, zayıf noktaları anlık görüntüle.',
    highlight: false,
  },
  {
    icon: Flame,
    title: 'Günlük Seri & Motivasyon',
    desc: 'Streak takibi, XP sistemi, başarı rozetleri. Alışkanlık oluşturmak için tasarlandı.',
    highlight: false,
  },
];

const stats = [
  { value: '8', label: 'Çalışma Modu', suffix: '' },
  { value: '100', label: 'Ücretsiz Kullanım', suffix: '%' },
  { value: 'SRS', label: 'Algoritması', suffix: '' },
  { value: 'AI', label: 'Destekli', suffix: '' },
];

const faqs = [
  { q: 'VocabMaster ücretsiz mi?', a: 'Evet. Sınırsız kelime, sınırsız liste ve tüm 8 çalışma modu tamamen ücretsiz. Sadece AI özellikler için Pro plan var (₺49.99/ay).' },
  { q: 'Duolingo veya Quizlet\'ten farkı ne?', a: 'VocabMaster\'ın SRS algoritması gerçek hafıza bilimine dayanır. Ayrıca 8 farklı mod ile her öğrenme stiline hitap eder. Kendi kelime listeni oluşturursun — hazır içerikle sınırlandırılmazsın.' },
  { q: 'Başlamak için ne gerekiyor?', a: 'Sadece bir hesap oluştur, bir kelime listesi ekle ve çalışmaya başla. 2 dakikada hazır.' },
  { q: 'AI özellikleri ne işe yarar?', a: 'AI ile tek kelimeden anlamı, örnek cümle, IPA ve Türkçe çevirisini otomatik üretebilirsin. Story modunda ise öğrendiğin kelimelerle anlamlı hikayeler oluşturulur.' },
];

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setIsFlipped(false);
      setTimeout(() => setWordIndex(i => (i + 1) % demoWords.length), 300);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const word = demoWords[wordIndex];

  return (
    <div className="bg-[#0b0f17] text-white min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 text-[#135bec] text-xs font-semibold mb-8">
          <Zap size={12} fill="currentColor" />
          AI Destekli · SRS Algoritması · 8 Çalışma Modu
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          İngilizce kelimeleri{' '}
          <span className="text-[#135bec]">gerçekten</span>{' '}
          öğrenin
        </h1>

        <p className="text-[#6b7a94] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Ezber değil, bilim. SRS algoritması ve 8 farklı çalışma moduyla kelimeler uzun süreli belleğe kazınır.
          Duolingo&apos;dan daha derin, Anki&apos;den çok daha kolay.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#135bec] text-white rounded-xl font-semibold hover:bg-[#1a6ef5] transition-colors text-sm"
          >
            Ücretsiz Başla
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/study/select"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/6 border border-white/8 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm"
          >
            <PlayCircle size={16} />
            Demo Gör
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#6b7a94]">Kredi kartı gerekmez · Sınırsız ücretsiz kullanım</p>
      </section>

      {/* ── INTERACTIVE DEMO CARD ── */}
      <section className="max-w-sm mx-auto px-4 mb-20">
        <div className="text-center mb-4">
          <span className="text-xs text-[#6b7a94] uppercase tracking-widest">Canlı Demo</span>
        </div>
        <div
          className="relative h-52 cursor-pointer select-none"
          style={{ perspective: '1000px' }}
          onClick={() => setIsFlipped(f => !f)}
        >
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl bg-[#111827] border border-white/8 flex flex-col items-center justify-center p-6"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-xs text-[#135bec] font-semibold uppercase tracking-widest mb-2">{word.level}</span>
              <h2 className="text-3xl font-bold text-white mb-2">{word.word}</h2>
              <span className="text-sm text-[#6b7a94] font-mono">{word.ipa}</span>
              <span className="mt-6 text-xs text-[#6b7a94]">Çevirmek için tıkla →</span>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl bg-[#111827] border border-[#135bec]/25 flex flex-col items-center justify-center p-6"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="text-lg font-bold text-white mb-3">{word.tr}</span>
              <p className="text-xs text-[#6b7a94] text-center leading-relaxed italic">&ldquo;{word.sentence}&rdquo;</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-[#6b7a94] mt-3">Flashcard modu — 8 moddan biri</p>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#111827] border border-white/6 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-white mb-1">{s.value}{s.suffix}</div>
              <div className="text-xs text-[#6b7a94]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STUDY MODES ── */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Her öğrenme stiline göre mod</h2>
          <p className="text-[#6b7a94] text-sm max-w-md mx-auto">
            Tek bir yöntemle sıkılmak yok. 8 farklı mod arasında geç, her gün farklı bir deneyim yaşa.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {studyModes.map((mode) => {
            const ModeIcon = mode.icon;
            return (
              <div
                key={mode.name}
                className="bg-[#111827] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-colors"
              >
                <ModeIcon size={20} className={`${mode.color} mb-3`} />
                <div className="text-sm font-semibold text-white mb-0.5">{mode.name}</div>
                <div className="text-xs text-[#6b7a94]">{mode.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Rakiplerden neden üstün?</h2>
          <p className="text-[#6b7a94] text-sm max-w-md mx-auto">
            Sadece kelime ezberletmiyoruz. Öğreniyor, hatırlıyor ve kullanıyorsunuz.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const FIcon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-xl p-6 border transition-colors ${
                  f.highlight
                    ? 'bg-[#135bec]/6 border-[#135bec]/20'
                    : 'bg-[#111827] border-white/6'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.highlight ? 'bg-[#135bec]/15' : 'bg-white/5'}`}>
                  <FIcon size={20} className={f.highlight ? 'text-[#135bec]' : 'text-[#6b7a94]'} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[#6b7a94] text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="max-w-3xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Rakip karşılaştırması</h2>
        </div>
        <div className="bg-[#111827] border border-white/6 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left py-3 px-4 text-[#6b7a94] font-medium">Özellik</th>
                <th className="py-3 px-4 text-[#135bec] font-semibold">VocabMaster</th>
                <th className="py-3 px-4 text-[#6b7a94] font-medium">Duolingo</th>
                <th className="py-3 px-4 text-[#6b7a94] font-medium">Quizlet</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['SRS algoritması', true, false, 'Kısıtlı'],
                ['Kendi kelime listesi', true, false, true],
                ['Çalışma modu sayısı', '8 mod', '1 mod', '5 mod'],
                ['Ücretsiz erişim', 'Sınırsız', 'Kısıtlı', 'Kısıtlı'],
                ['AI kelime üretimi', true, false, false],
                ['Türkçe destek', 'Tam', 'Kısıtlı', 'Kısıtlı'],
              ].map(([feat, vm, duo, quizlet]) => (
                <tr key={String(feat)} className="border-b border-white/4 last:border-0">
                  <td className="py-3 px-4 text-[#c4d0e4]">{feat}</td>
                  <td className="py-3 px-4 text-center">
                    {vm === true ? <Check size={16} className="text-emerald-400 mx-auto" /> : <span className="text-[#135bec] font-semibold">{vm}</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-[#6b7a94]">
                    {duo === true ? <Check size={16} className="text-emerald-400 mx-auto" /> : duo === false ? '✗' : duo}
                  </td>
                  <td className="py-3 px-4 text-center text-[#6b7a94]">
                    {quizlet === true ? <Check size={16} className="text-emerald-400 mx-auto" /> : quizlet === false ? '✗' : quizlet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { stars: 5, text: 'SRS sistemi gerçekten işe yarıyor. 2 ayda 500+ kelime öğrendim.', name: 'Ayşe K.', role: 'YDS Hazırlık' },
            { stars: 5, text: 'Duolingo\'dan geçiş yaptım, çok daha etkili. Kelimeler aklımda kalıyor.', name: 'Mehmet A.', role: 'Üniversite Öğrencisi' },
            { stars: 5, text: '8 mod sayesinde sıkılmıyorum. Her gün farklı bir şey yapıyorum.', name: 'Zeynep B.', role: 'İş İngilizcesi' },
          ].map((r, i) => (
            <div key={i} className="bg-[#111827] border border-white/6 rounded-xl p-5">
              <div className="flex mb-3">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-[#c4d0e4] text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <div>
                <div className="text-sm font-medium text-white">{r.name}</div>
                <div className="text-xs text-[#6b7a94]">{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-4 mb-24 text-center">
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-10">
          <Trophy size={32} className="text-amber-400 mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Bugün başla, ücretsiz</h2>
          <p className="text-[#6b7a94] text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Kredi kartı gerekmez. Sınırsız kelime, sınırsız liste, tüm çalışma modları ücretsiz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#135bec] text-white rounded-xl font-semibold hover:bg-[#1a6ef5] transition-colors text-sm"
            >
              Hesap Oluştur
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/6 border border-white/8 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm"
            >
              Giriş Yap
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-[#6b7a94]">
            {['Ücretsiz başla', 'Kredi kartı yok', 'İstediğin zaman iptal'].map(t => (
              <span key={t} className="flex items-center gap-1">
                <Check size={12} className="text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 mb-24">
        <h2 className="text-2xl font-bold text-center mb-8">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#111827] border border-white/6 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#6b7a94] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-[#6b7a94] leading-relaxed border-t border-white/6 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
