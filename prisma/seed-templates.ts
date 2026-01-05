// Seed script for pre-made word list templates
// Run with: npx tsx prisma/seed-templates.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
    {
        name: 'YDS Akademik Kelimeler',
        description: 'YDS ve akademik İngilizce sınavlarına hazırlık için temel kelimeler',
        category: 'Sınav',
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
            { word: 'implementation', turkishTranslation: 'uygulama', definitionTr: 'Bir planı hayata geçirme süreci', exampleSentence: 'The implementation of the new policy begins next month.', exampleSentenceTr: 'Yeni politikanın uygulaması gelecek ay başlıyor.', type: 'noun', level: 'B2' },
            { word: 'constraint', turkishTranslation: 'kısıtlama', definitionTr: 'Sınırlama veya engel', exampleSentence: 'Budget constraints limited our options.', exampleSentenceTr: 'Bütçe kısıtlamaları seçeneklerimizi sınırladı.', type: 'noun', level: 'C1' },
            { word: 'relevant', turkishTranslation: 'ilgili, alakalı', definitionTr: 'Konuyla bağlantılı', exampleSentence: 'Please provide relevant information only.', exampleSentenceTr: 'Lütfen yalnızca ilgili bilgileri sağlayın.', type: 'adjective', level: 'B2' },
            { word: 'subsequent', turkishTranslation: 'sonraki, müteakip', definitionTr: 'Daha sonra gelen', exampleSentence: 'In subsequent years, the company grew rapidly.', exampleSentenceTr: 'Sonraki yıllarda şirket hızla büyüdü.', type: 'adjective', level: 'C1' },
            { word: 'hypothesis', turkishTranslation: 'hipotez, varsayım', definitionTr: 'Kanıtlanmayı bekleyen varsayım', exampleSentence: 'We need to test this hypothesis.', exampleSentenceTr: 'Bu hipotezi test etmemiz gerekiyor.', type: 'noun', level: 'C1' }
        ]
    },
    {
        name: 'Günlük Konuşma',
        description: 'Günlük hayatta en sık kullanılan temel İngilizce ifadeler',
        category: 'Günlük',
        words: [
            { word: 'awesome', turkishTranslation: 'harika', definitionTr: 'Çok iyi, mükemmel', exampleSentence: 'That movie was awesome!', exampleSentenceTr: 'O film harikaydı!', type: 'adjective', level: 'A2' },
            { word: 'actually', turkishTranslation: 'aslında', definitionTr: 'Gerçekte, doğrusu', exampleSentence: 'Actually, I prefer coffee over tea.', exampleSentenceTr: 'Aslında, çaydan çok kahveyi tercih ederim.', type: 'adverb', level: 'A2' },
            { word: 'definitely', turkishTranslation: 'kesinlikle', definitionTr: 'Şüphesiz, mutlaka', exampleSentence: 'I will definitely come to your party.', exampleSentenceTr: 'Partine kesinlikle geleceğim.', type: 'adverb', level: 'A2' },
            { word: 'basically', turkishTranslation: 'temelde, aslında', definitionTr: 'Özünde, kısaca', exampleSentence: 'Basically, we need more time.', exampleSentenceTr: 'Temelde, daha fazla zamana ihtiyacımız var.', type: 'adverb', level: 'B1' },
            { word: 'meanwhile', turkishTranslation: 'bu arada', definitionTr: 'Aynı zamanda, bu esnada', exampleSentence: 'I cooked dinner; meanwhile, she set the table.', exampleSentenceTr: 'Yemeği pişirdim; bu arada, o masayı hazırladı.', type: 'adverb', level: 'B1' },
            { word: 'annoying', turkishTranslation: 'sinir bozucu', definitionTr: 'Rahatsız edici, can sıkıcı', exampleSentence: 'That noise is so annoying!', exampleSentenceTr: 'O gürültü çok sinir bozucu!', type: 'adjective', level: 'A2' },
            { word: 'convenient', turkishTranslation: 'uygun, elverişli', definitionTr: 'Kullanışlı, pratik', exampleSentence: 'Is this time convenient for you?', exampleSentenceTr: 'Bu saat senin için uygun mu?', type: 'adjective', level: 'B1' },
            { word: 'embarrassed', turkishTranslation: 'utanmış', definitionTr: 'Mahcup olmuş', exampleSentence: 'I was embarrassed by my mistake.', exampleSentenceTr: 'Hatamdan dolayı utandım.', type: 'adjective', level: 'B1' },
            { word: 'exhausted', turkishTranslation: 'bitkin, tükenmiş', definitionTr: 'Çok yorgun', exampleSentence: 'I\'m exhausted after that long meeting.', exampleSentenceTr: 'O uzun toplantıdan sonra bitkinim.', type: 'adjective', level: 'B1' },
            { word: 'apologize', turkishTranslation: 'özür dilemek', definitionTr: 'Af dilemek', exampleSentence: 'I apologize for being late.', exampleSentenceTr: 'Geç kaldığım için özür dilerim.', type: 'verb', level: 'A2' },
            { word: 'appreciate', turkishTranslation: 'takdir etmek', definitionTr: 'Değer vermek, minnettar olmak', exampleSentence: 'I really appreciate your help.', exampleSentenceTr: 'Yardımını gerçekten takdir ediyorum.', type: 'verb', level: 'B1' },
            { word: 'recommend', turkishTranslation: 'tavsiye etmek', definitionTr: 'Önermek', exampleSentence: 'Can you recommend a good restaurant?', exampleSentenceTr: 'İyi bir restoran tavsiye edebilir misin?', type: 'verb', level: 'B1' },
            { word: 'available', turkishTranslation: 'müsait, mevcut', definitionTr: 'Ulaşılabilir, boş', exampleSentence: 'Are you available tomorrow?', exampleSentenceTr: 'Yarın müsait misin?', type: 'adjective', level: 'A2' },
            { word: 'schedule', turkishTranslation: 'program, takvim', definitionTr: 'Planlı zaman çizelgesi', exampleSentence: 'What\'s your schedule like this week?', exampleSentenceTr: 'Bu hafta programın nasıl?', type: 'noun', level: 'A2' },
            { word: 'handle', turkishTranslation: 'halletmek, idare etmek', definitionTr: 'Başa çıkmak, yönetmek', exampleSentence: 'I can handle this situation.', exampleSentenceTr: 'Bu durumu halledebilirim.', type: 'verb', level: 'B1' }
        ]
    },
    {
        name: 'Seyahat İngilizcesi',
        description: 'Yurt dışı seyahatlerinde işinize yarayacak pratik kelimeler',
        category: 'Seyahat',
        words: [
            { word: 'departure', turkishTranslation: 'kalkış', definitionTr: 'Bir yerden ayrılma', exampleSentence: 'The departure time is 10:30 AM.', exampleSentenceTr: 'Kalkış saati 10:30.', type: 'noun', level: 'A2' },
            { word: 'arrival', turkishTranslation: 'varış', definitionTr: 'Bir yere ulaşma', exampleSentence: 'Please wait at the arrival gate.', exampleSentenceTr: 'Lütfen varış kapısında bekleyin.', type: 'noun', level: 'A2' },
            { word: 'reservation', turkishTranslation: 'rezervasyon', definitionTr: 'Önceden yapılan ayırtma', exampleSentence: 'I have a reservation under my name.', exampleSentenceTr: 'Adıma rezervasyonum var.', type: 'noun', level: 'A2' },
            { word: 'luggage', turkishTranslation: 'bagaj', definitionTr: 'Yolculuk çantaları', exampleSentence: 'Where can I pick up my luggage?', exampleSentenceTr: 'Bagajımı nereden alabilirim?', type: 'noun', level: 'A2' },
            { word: 'boarding pass', turkishTranslation: 'biniş kartı', definitionTr: 'Uçağa biniş belgesi', exampleSentence: 'Please show your boarding pass.', exampleSentenceTr: 'Lütfen biniş kartınızı gösterin.', type: 'noun', level: 'A2' },
            { word: 'currency', turkishTranslation: 'para birimi', definitionTr: 'Bir ülkede kullanılan para', exampleSentence: 'What currency do they use here?', exampleSentenceTr: 'Burada hangi para birimini kullanıyorlar?', type: 'noun', level: 'B1' },
            { word: 'directions', turkishTranslation: 'yol tarifi', definitionTr: 'Bir yere nasıl gidileceği bilgisi', exampleSentence: 'Could you give me directions to the hotel?', exampleSentenceTr: 'Otele yol tarifi verebilir misiniz?', type: 'noun', level: 'A2' },
            { word: 'customs', turkishTranslation: 'gümrük', definitionTr: 'Sınır kontrol noktası', exampleSentence: 'You need to go through customs.', exampleSentenceTr: 'Gümrükten geçmeniz gerekiyor.', type: 'noun', level: 'B1' },
            { word: 'accommodation', turkishTranslation: 'konaklama', definitionTr: 'Kalacak yer', exampleSentence: 'Have you booked your accommodation?', exampleSentenceTr: 'Konaklama yerinizi ayırttınız mı?', type: 'noun', level: 'B1' },
            { word: 'sightseeing', turkishTranslation: 'gezi, tur', definitionTr: 'Turistik yerleri ziyaret etme', exampleSentence: 'We went sightseeing in the old town.', exampleSentenceTr: 'Eski şehirde geziye çıktık.', type: 'noun', level: 'A2' },
            { word: 'itinerary', turkishTranslation: 'seyahat planı', definitionTr: 'Gezi rotası ve programı', exampleSentence: 'What\'s our itinerary for tomorrow?', exampleSentenceTr: 'Yarın için seyahat planımız ne?', type: 'noun', level: 'B2' },
            { word: 'delayed', turkishTranslation: 'gecikmeli', definitionTr: 'Planlanandan geç', exampleSentence: 'The flight is delayed by two hours.', exampleSentenceTr: 'Uçuş iki saat gecikmeli.', type: 'adjective', level: 'A2' },
            { word: 'canceled', turkishTranslation: 'iptal edilmiş', definitionTr: 'Vazgeçilmiş, durdurulmuş', exampleSentence: 'Unfortunately, my flight was canceled.', exampleSentenceTr: 'Ne yazık ki uçuşum iptal edildi.', type: 'adjective', level: 'A2' },
            { word: 'aisle', turkishTranslation: 'koridor', definitionTr: 'İki sıra arasındaki geçit', exampleSentence: 'I\'d like an aisle seat, please.', exampleSentenceTr: 'Koridor tarafı koltuk istiyorum, lütfen.', type: 'noun', level: 'B1' },
            { word: 'transfer', turkishTranslation: 'aktarma', definitionTr: 'Bir araçtan diğerine geçiş', exampleSentence: 'We have a transfer in London.', exampleSentenceTr: 'Londra\'da aktarmamız var.', type: 'noun', level: 'B1' }
        ]
    }
];

async function seedTemplates() {
    console.log('🌱 Seeding word list templates...\n');

    for (const template of templates) {
        console.log(`📚 Creating template: ${template.name}`);

        // Check if template already exists
        const existing = await prisma.wordList.findFirst({
            where: { name: template.name, isSystem: true }
        });

        if (existing) {
            console.log(`   ⏭️  Template already exists, skipping...\n`);
            continue;
        }

        // Create words first
        const createdWords = [];
        for (const wordData of template.words) {
            // Check if word already exists
            let word = await prisma.word.findFirst({
                where: {
                    word: wordData.word,
                    level: wordData.level
                }
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
                        category: template.category,
                        isSystem: true
                    }
                });
            }
            createdWords.push(word);
        }

        // Create the word list
        const wordList = await prisma.wordList.create({
            data: {
                name: template.name,
                description: template.description,
                category: template.category,
                isSystem: true,
                items: {
                    create: createdWords.map(word => ({
                        wordId: word.id
                    }))
                }
            }
        });

        console.log(`   ✅ Created with ${createdWords.length} words\n`);
    }

    console.log('🎉 Seeding complete!');
}

seedTemplates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
