'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Hardcoded template data - no need for database seeding!
const TEMPLATES = [
    {
        id: 'yds-akademik',
        name: 'YDS Akademik Kelimeler',
        description: 'YDS ve akademik İngilizce sınavlarına hazırlık için temel kelimeler',
        category: 'Sınav',
        words: [
            { word: 'consequently', turkishTranslation: 'sonuç olarak', definitionTr: 'Bir şeyin sonucu olarak', exampleSentence: 'He failed the exam; consequently, he had to retake the course.', exampleSentenceTr: 'Sınavda başarısız oldu; sonuç olarak, dersi tekrar almak zorunda kaldı.', type: 'adverb' },
            { word: 'furthermore', turkishTranslation: 'ayrıca, üstelik', definitionTr: 'Ek olarak, bunun yanı sıra', exampleSentence: 'The project is expensive; furthermore, it will take years to complete.', exampleSentenceTr: 'Proje pahalı; ayrıca, tamamlanması yıllar sürecek.', type: 'adverb' },
            { word: 'nevertheless', turkishTranslation: 'yine de, buna rağmen', definitionTr: 'Buna karşın, yine de', exampleSentence: 'The weather was terrible; nevertheless, we enjoyed our trip.', exampleSentenceTr: 'Hava berbattı; yine de, gezimizi keyifle geçirdik.', type: 'adverb' },
            { word: 'significant', turkishTranslation: 'önemli, kayda değer', definitionTr: 'Dikkat çekici derecede büyük veya önemli', exampleSentence: 'There has been a significant increase in sales.', exampleSentenceTr: 'Satışlarda kayda değer bir artış oldu.', type: 'adjective' },
            { word: 'comprehensive', turkishTranslation: 'kapsamlı', definitionTr: 'Her şeyi kapsayan, eksiksiz', exampleSentence: 'We need a comprehensive review of the situation.', exampleSentenceTr: 'Durumun kapsamlı bir incelemesine ihtiyacımız var.', type: 'adjective' },
            { word: 'emphasize', turkishTranslation: 'vurgulamak', definitionTr: 'Önemini belirtmek', exampleSentence: 'I want to emphasize the importance of teamwork.', exampleSentenceTr: 'Takım çalışmasının önemini vurgulamak istiyorum.', type: 'verb' },
            { word: 'acknowledge', turkishTranslation: 'kabul etmek', definitionTr: 'Bir şeyin doğru olduğunu kabul etmek', exampleSentence: 'She acknowledged her mistake and apologized.', exampleSentenceTr: 'Hatasını kabul etti ve özür diledi.', type: 'verb' },
            { word: 'deteriorate', turkishTranslation: 'kötüleşmek', definitionTr: 'Giderek daha kötü hale gelmek', exampleSentence: 'His health continued to deteriorate.', exampleSentenceTr: 'Sağlığı kötüleşmeye devam etti.', type: 'verb' },
            { word: 'inevitable', turkishTranslation: 'kaçınılmaz', definitionTr: 'Engellenmesi mümkün olmayan', exampleSentence: 'Change is inevitable in any organization.', exampleSentenceTr: 'Değişim her organizasyonda kaçınılmazdır.', type: 'adjective' },
            { word: 'ambiguous', turkishTranslation: 'belirsiz, muğlak', definitionTr: 'Birden fazla anlama gelebilen', exampleSentence: 'The instructions were ambiguous.', exampleSentenceTr: 'Talimatlar belirsizdi.', type: 'adjective' },
            { word: 'hypothesis', turkishTranslation: 'hipotez', definitionTr: 'Kanıtlanmayı bekleyen varsayım', exampleSentence: 'We need to test this hypothesis.', exampleSentenceTr: 'Bu hipotezi test etmemiz gerekiyor.', type: 'noun' }
        ]
    },
    {
        id: 'gunluk-konusma',
        name: 'Günlük Konuşma',
        description: 'Günlük hayatta en sık kullanılan temel İngilizce ifadeler',
        category: 'Günlük',
        words: [
            { word: 'awesome', turkishTranslation: 'harika', definitionTr: 'Çok iyi, mükemmel', exampleSentence: 'That movie was awesome!', exampleSentenceTr: 'O film harikaydı!', type: 'adjective' },
            { word: 'actually', turkishTranslation: 'aslında', definitionTr: 'Gerçekte, doğrusu', exampleSentence: 'Actually, I prefer coffee over tea.', exampleSentenceTr: 'Aslında, çaydan çok kahveyi tercih ederim.', type: 'adverb' },
            { word: 'definitely', turkishTranslation: 'kesinlikle', definitionTr: 'Şüphesiz, mutlaka', exampleSentence: 'I will definitely come to your party.', exampleSentenceTr: 'Partine kesinlikle geleceğim.', type: 'adverb' },
            { word: 'basically', turkishTranslation: 'temelde', definitionTr: 'Özünde, kısaca', exampleSentence: 'Basically, we need more time.', exampleSentenceTr: 'Temelde, daha fazla zamana ihtiyacımız var.', type: 'adverb' },
            { word: 'convenient', turkishTranslation: 'uygun', definitionTr: 'Kullanışlı, pratik', exampleSentence: 'Is this time convenient for you?', exampleSentenceTr: 'Bu saat senin için uygun mu?', type: 'adjective' },
            { word: 'exhausted', turkishTranslation: 'bitkin', definitionTr: 'Çok yorgun', exampleSentence: 'I am exhausted after that long meeting.', exampleSentenceTr: 'O uzun toplantıdan sonra bitkinim.', type: 'adjective' },
            { word: 'apologize', turkishTranslation: 'özür dilemek', definitionTr: 'Af dilemek', exampleSentence: 'I apologize for being late.', exampleSentenceTr: 'Geç kaldığım için özür dilerim.', type: 'verb' },
            { word: 'appreciate', turkishTranslation: 'takdir etmek', definitionTr: 'Değer vermek', exampleSentence: 'I really appreciate your help.', exampleSentenceTr: 'Yardımını gerçekten takdir ediyorum.', type: 'verb' },
            { word: 'recommend', turkishTranslation: 'tavsiye etmek', definitionTr: 'Önermek', exampleSentence: 'Can you recommend a good restaurant?', exampleSentenceTr: 'İyi bir restoran tavsiye edebilir misin?', type: 'verb' },
            { word: 'available', turkishTranslation: 'müsait', definitionTr: 'Ulaşılabilir, boş', exampleSentence: 'Are you available tomorrow?', exampleSentenceTr: 'Yarın müsait misin?', type: 'adjective' }
        ]
    },
    {
        id: 'seyahat',
        name: 'Seyahat İngilizcesi',
        description: 'Yurt dışı seyahatlerinde işinize yarayacak pratik kelimeler',
        category: 'Seyahat',
        words: [
            { word: 'departure', turkishTranslation: 'kalkış', definitionTr: 'Bir yerden ayrılma', exampleSentence: 'The departure time is 10:30 AM.', exampleSentenceTr: 'Kalkış saati 10:30.', type: 'noun' },
            { word: 'arrival', turkishTranslation: 'varış', definitionTr: 'Bir yere ulaşma', exampleSentence: 'Please wait at the arrival gate.', exampleSentenceTr: 'Lütfen varış kapısında bekleyin.', type: 'noun' },
            { word: 'reservation', turkishTranslation: 'rezervasyon', definitionTr: 'Önceden yapılan ayırtma', exampleSentence: 'I have a reservation under my name.', exampleSentenceTr: 'Adıma rezervasyonum var.', type: 'noun' },
            { word: 'luggage', turkishTranslation: 'bagaj', definitionTr: 'Yolculuk çantaları', exampleSentence: 'Where can I pick up my luggage?', exampleSentenceTr: 'Bagajımı nereden alabilirim?', type: 'noun' },
            { word: 'currency', turkishTranslation: 'para birimi', definitionTr: 'Bir ülkede kullanılan para', exampleSentence: 'What currency do they use here?', exampleSentenceTr: 'Burada hangi para birimini kullanıyorlar?', type: 'noun' },
            { word: 'directions', turkishTranslation: 'yol tarifi', definitionTr: 'Bir yere nasıl gidileceği', exampleSentence: 'Could you give me directions to the hotel?', exampleSentenceTr: 'Otele yol tarifi verebilir misiniz?', type: 'noun' },
            { word: 'customs', turkishTranslation: 'gümrük', definitionTr: 'Sınır kontrol noktası', exampleSentence: 'You need to go through customs.', exampleSentenceTr: 'Gümrükten geçmeniz gerekiyor.', type: 'noun' },
            { word: 'accommodation', turkishTranslation: 'konaklama', definitionTr: 'Kalacak yer', exampleSentence: 'Have you booked your accommodation?', exampleSentenceTr: 'Konaklama yerinizi ayırttınız mı?', type: 'noun' },
            { word: 'delayed', turkishTranslation: 'gecikmeli', definitionTr: 'Planlanandan geç', exampleSentence: 'The flight is delayed by two hours.', exampleSentenceTr: 'Uçuş iki saat gecikmeli.', type: 'adjective' },
            { word: 'transfer', turkishTranslation: 'aktarma', definitionTr: 'Bir araçtan diğerine geçiş', exampleSentence: 'We have a transfer in London.', exampleSentenceTr: 'Londrada aktarmamız var.', type: 'noun' }
        ]
    }
];

export default function TemplatesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [copying, setCopying] = useState<string | null>(null);
    const [copied, setCopied] = useState<string[]>([]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#135bec] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    const copyToAccount = async (template: typeof TEMPLATES[0]) => {
        setCopying(template.id);
        try {
            const res = await fetch('/api/wordlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: template.name,
                    description: template.description,
                    words: template.words
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCopied([...copied, template.id]);
                router.push(`/wordlists/${data.id}`);
            } else {
                alert('Liste eklenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error:', error);
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
                        Bir listeyi seç ve hemen pratik yapmaya başla!
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template) => (
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
                                    {template.words.length} kelime
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-[#8b9bb4] text-sm border border-white/10">
                                    {template.category}
                                </span>
                            </div>

                            {/* Preview Words */}
                            <div className="space-y-2 mb-6">
                                <p className="text-xs text-[#8b9bb4] uppercase tracking-wider font-medium">Örnek Kelimeler:</p>
                                <div className="flex flex-wrap gap-1">
                                    {template.words.slice(0, 4).map((word, idx) => (
                                        <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 text-white text-xs">
                                            {word.word}
                                        </span>
                                    ))}
                                    {template.words.length > 4 && (
                                        <span className="px-2 py-1 rounded-lg bg-white/5 text-[#8b9bb4] text-xs">
                                            +{template.words.length - 4} daha
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={() => copyToAccount(template)}
                                disabled={copying === template.id || copied.includes(template.id)}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied.includes(template.id)
                                        ? 'bg-green-600 text-white cursor-default'
                                        : 'bg-gradient-to-r from-[#135bec] to-blue-600 text-white hover:shadow-[0_0_20px_rgba(19,91,236,0.5)] disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {copying === template.id ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Ekleniyor...
                                    </>
                                ) : copied.includes(template.id) ? (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Eklendi!
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
            </div>
        </div>
    );
}
