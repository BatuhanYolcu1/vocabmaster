import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple seed endpoint - no authentication for now
// DELETE this file after seeding!

const templates = [
    {
        name: 'YDS Akademik Kelimeler',
        description: 'YDS ve akademik İngilizce sınavlarına hazırlık için temel kelimeler',
        words: [
            { word: 'consequently', turkishTranslation: 'sonuç olarak', definitionTr: 'Bir şeyin sonucu olarak', exampleSentence: 'He failed the exam; consequently, he had to retake the course.', exampleSentenceTr: 'Sınavda başarısız oldu; sonuç olarak, dersi tekrar almak zorunda kaldı.', type: 'adverb', level: 'C1' },
            { word: 'furthermore', turkishTranslation: 'ayrıca, üstelik', definitionTr: 'Ek olarak, bunun yanı sıra', exampleSentence: 'The project is expensive; furthermore, it will take years to complete.', exampleSentenceTr: 'Proje pahalı; ayrıca, tamamlanması yıllar sürecek.', type: 'adverb', level: 'B2' },
            { word: 'nevertheless', turkishTranslation: 'yine de, buna rağmen', definitionTr: 'Buna karşın, yine de', exampleSentence: 'The weather was terrible; nevertheless, we enjoyed our trip.', exampleSentenceTr: 'Hava berbattı; yine de, gezimizi keyifle geçirdik.', type: 'adverb', level: 'B2' },
            { word: 'significant', turkishTranslation: 'önemli, kayda değer', definitionTr: 'Dikkat çekici derecede büyük veya önemli', exampleSentence: 'There has been a significant increase in sales.', exampleSentenceTr: 'Satışlarda kayda değer bir artış oldu.', type: 'adjective', level: 'B2' },
            { word: 'comprehensive', turkishTranslation: 'kapsamlı', definitionTr: 'Her şeyi kapsayan, eksiksiz', exampleSentence: 'We need a comprehensive review of the situation.', exampleSentenceTr: 'Durumun kapsamlı bir incelemesine ihtiyacımız var.', type: 'adjective', level: 'B2' },
            { word: 'emphasize', turkishTranslation: 'vurgulamak', definitionTr: 'Önemini belirtmek', exampleSentence: 'I want to emphasize the importance of teamwork.', exampleSentenceTr: 'Takım çalışmasının önemini vurgulamak istiyorum.', type: 'verb', level: 'B2' },
            { word: 'acknowledge', turkishTranslation: 'kabul etmek, onaylamak', definitionTr: 'Bir şeyin var olduğunu veya doğru olduğunu kabul etmek', exampleSentence: 'She acknowledged her mistake and apologized.', exampleSentenceTr: 'Hatasını kabul etti ve özür diledi.', type: 'verb', level: 'B2' },
            { word: 'deteriorate', turkishTranslation: 'kötüleşmek', definitionTr: 'Giderek daha kötü hale gelmek', exampleSentence: 'His health continued to deteriorate.', exampleSentenceTr: 'Sağlığı kötüleşmeye devam etti.', type: 'verb', level: 'C1' },
            { word: 'inevitable', turkishTranslation: 'kaçınılmaz', definitionTr: 'Engellenmesi mümkün olmayan', exampleSentence: 'Change is inevitable in any organization.', exampleSentenceTr: 'Değişim her organizasyonda kaçınılmazdır.', type: 'adjective', level: 'B2' },
            { word: 'ambiguous', turkishTranslation: 'belirsiz, muğlak', definitionTr: 'Birden fazla anlama gelebilen', exampleSentence: 'The instructions were ambiguous.', exampleSentenceTr: 'Talimatlar belirsizdi.', type: 'adjective', level: 'C1' },
            { word: 'hypothesis', turkishTranslation: 'hipotez, varsayım', definitionTr: 'Kanıtlanmayı bekleyen varsayım', exampleSentence: 'We need to test this hypothesis.', exampleSentenceTr: 'Bu hipotezi test etmemiz gerekiyor.', type: 'noun', level: 'C1' }
        ]
    },
    {
        name: 'Günlük Konuşma',
        description: 'Günlük hayatta en sık kullanılan temel İngilizce ifadeler',
        words: [
            { word: 'awesome', turkishTranslation: 'harika', definitionTr: 'Çok iyi, mükemmel', exampleSentence: 'That movie was awesome!', exampleSentenceTr: 'O film harikaydı!', type: 'adjective', level: 'A2' },
            { word: 'actually', turkishTranslation: 'aslında', definitionTr: 'Gerçekte, doğrusu', exampleSentence: 'Actually, I prefer coffee over tea.', exampleSentenceTr: 'Aslında, çaydan çok kahveyi tercih ederim.', type: 'adverb', level: 'A2' },
            { word: 'definitely', turkishTranslation: 'kesinlikle', definitionTr: 'Şüphesiz, mutlaka', exampleSentence: 'I will definitely come to your party.', exampleSentenceTr: 'Partine kesinlikle geleceğim.', type: 'adverb', level: 'A2' },
            { word: 'basically', turkishTranslation: 'temelde, aslında', definitionTr: 'Özünde, kısaca', exampleSentence: 'Basically, we need more time.', exampleSentenceTr: 'Temelde, daha fazla zamana ihtiyacımız var.', type: 'adverb', level: 'B1' },
            { word: 'convenient', turkishTranslation: 'uygun, elverişli', definitionTr: 'Kullanışlı, pratik', exampleSentence: 'Is this time convenient for you?', exampleSentenceTr: 'Bu saat senin için uygun mu?', type: 'adjective', level: 'B1' },
            { word: 'exhausted', turkishTranslation: 'bitkin, tükenmiş', definitionTr: 'Çok yorgun', exampleSentence: 'I am exhausted after that long meeting.', exampleSentenceTr: 'O uzun toplantıdan sonra bitkinim.', type: 'adjective', level: 'B1' },
            { word: 'apologize', turkishTranslation: 'özür dilemek', definitionTr: 'Af dilemek', exampleSentence: 'I apologize for being late.', exampleSentenceTr: 'Geç kaldığım için özür dilerim.', type: 'verb', level: 'A2' },
            { word: 'appreciate', turkishTranslation: 'takdir etmek', definitionTr: 'Değer vermek, minnettar olmak', exampleSentence: 'I really appreciate your help.', exampleSentenceTr: 'Yardımını gerçekten takdir ediyorum.', type: 'verb', level: 'B1' },
            { word: 'recommend', turkishTranslation: 'tavsiye etmek', definitionTr: 'Önermek', exampleSentence: 'Can you recommend a good restaurant?', exampleSentenceTr: 'İyi bir restoran tavsiye edebilir misin?', type: 'verb', level: 'B1' },
            { word: 'available', turkishTranslation: 'müsait, mevcut', definitionTr: 'Ulaşılabilir, boş', exampleSentence: 'Are you available tomorrow?', exampleSentenceTr: 'Yarın müsait misin?', type: 'adjective', level: 'A2' }
        ]
    },
    {
        name: 'Seyahat İngilizcesi',
        description: 'Yurt dışı seyahatlerinde işinize yarayacak pratik kelimeler',
        words: [
            { word: 'departure', turkishTranslation: 'kalkış', definitionTr: 'Bir yerden ayrılma', exampleSentence: 'The departure time is 10:30 AM.', exampleSentenceTr: 'Kalkış saati 10:30.', type: 'noun', level: 'A2' },
            { word: 'arrival', turkishTranslation: 'varış', definitionTr: 'Bir yere ulaşma', exampleSentence: 'Please wait at the arrival gate.', exampleSentenceTr: 'Lütfen varış kapısında bekleyin.', type: 'noun', level: 'A2' },
            { word: 'reservation', turkishTranslation: 'rezervasyon', definitionTr: 'Önceden yapılan ayırtma', exampleSentence: 'I have a reservation under my name.', exampleSentenceTr: 'Adıma rezervasyonum var.', type: 'noun', level: 'A2' },
            { word: 'luggage', turkishTranslation: 'bagaj', definitionTr: 'Yolculuk çantaları', exampleSentence: 'Where can I pick up my luggage?', exampleSentenceTr: 'Bagajımı nereden alabilirim?', type: 'noun', level: 'A2' },
            { word: 'currency', turkishTranslation: 'para birimi', definitionTr: 'Bir ülkede kullanılan para', exampleSentence: 'What currency do they use here?', exampleSentenceTr: 'Burada hangi para birimini kullanıyorlar?', type: 'noun', level: 'B1' },
            { word: 'directions', turkishTranslation: 'yol tarifi', definitionTr: 'Bir yere nasıl gidileceği bilgisi', exampleSentence: 'Could you give me directions to the hotel?', exampleSentenceTr: 'Otele yol tarifi verebilir misiniz?', type: 'noun', level: 'A2' },
            { word: 'customs', turkishTranslation: 'gümrük', definitionTr: 'Sınır kontrol noktası', exampleSentence: 'You need to go through customs.', exampleSentenceTr: 'Gümrükten geçmeniz gerekiyor.', type: 'noun', level: 'B1' },
            { word: 'accommodation', turkishTranslation: 'konaklama', definitionTr: 'Kalacak yer', exampleSentence: 'Have you booked your accommodation?', exampleSentenceTr: 'Konaklama yerinizi ayırttınız mı?', type: 'noun', level: 'B1' },
            { word: 'delayed', turkishTranslation: 'gecikmeli', definitionTr: 'Planlanandan geç', exampleSentence: 'The flight is delayed by two hours.', exampleSentenceTr: 'Uçuş iki saat gecikmeli.', type: 'adjective', level: 'A2' },
            { word: 'transfer', turkishTranslation: 'aktarma', definitionTr: 'Bir araçtan diğerine geçiş', exampleSentence: 'We have a transfer in London.', exampleSentenceTr: 'Londrada aktarmamız var.', type: 'noun', level: 'B1' }
        ]
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'vocab2024') {
        return NextResponse.json({ error: 'Secret required: ?secret=vocab2024' }, { status: 401 });
    }

    try {
        // First, create a system user if not exists
        let systemUser = await prisma.user.findFirst({
            where: { email: 'system@vocabmaster.app' }
        });

        if (!systemUser) {
            systemUser = await prisma.user.create({
                data: {
                    email: 'system@vocabmaster.app',
                    name: 'VocabMaster System',
                    password: 'not-a-real-password-hash'
                }
            });
        }

        const results = [];

        for (const template of templates) {
            // Check if list exists
            const existing = await prisma.wordList.findFirst({
                where: {
                    name: template.name,
                    userId: systemUser.id
                }
            });

            if (existing) {
                results.push({ name: template.name, status: 'already exists' });
                continue;
            }

            // Create words and word list
            const wordList = await prisma.wordList.create({
                data: {
                    name: template.name,
                    description: template.description,
                    userId: systemUser.id
                }
            });

            for (const wordData of template.words) {
                // Find or create word
                let word = await prisma.word.findFirst({
                    where: { word: wordData.word }
                });

                if (!word) {
                    word = await prisma.word.create({
                        data: {
                            word: wordData.word,
                            turkishTranslation: wordData.turkishTranslation,
                            definitionTr: wordData.definitionTr,
                            exampleSentence: wordData.exampleSentence,
                            exampleSentenceTr: wordData.exampleSentenceTr,
                            type: wordData.type,
                            level: wordData.level,
                            category: 'Genel',
                            isSystem: true
                        }
                    });
                }

                // Link word to list
                await prisma.wordListItem.create({
                    data: {
                        wordListId: wordList.id,
                        wordId: word.id
                    }
                });
            }

            results.push({ name: template.name, status: 'created', wordCount: template.words.length });
        }

        return NextResponse.json({
            success: true,
            systemUserId: systemUser.id,
            results
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({
            error: 'Failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
