import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create sample words
    const words = [
        {
            word: 'resilient',
            definitionTr: 'Zorluklardan hızla toparlanabilen; güçlü ve uyum sağlayabilen.',
            exampleSentence: 'Children are often more resilient than adults give them credit for.',
            exampleSentenceTr: 'Çocuklar genellikle yetişkinlerin düşündüğünden daha dayanıklıdır.',
            turkishTranslation: 'Dayanıklı, esnek',
            type: 'adjective',
            level: 'B2',
            category: 'Genel',
        },
        {
            word: 'scrutinize',
            definitionTr: 'Dikkatli ve ayrıntılı bir şekilde incelemek veya gözden geçirmek.',
            exampleSentence: 'The detective scrutinized every piece of evidence.',
            exampleSentenceTr: 'Dedektif her kanıtı dikkatle inceledi.',
            turkishTranslation: 'İncelemek, gözden geçirmek',
            type: 'verb',
            level: 'B2',
            category: 'İş',
        },
        {
            word: 'ambiguous',
            definitionTr: 'Birden fazla anlama gelebilen; net veya kesin olmayan.',
            exampleSentence: 'The contract contained several ambiguous clauses.',
            exampleSentenceTr: 'Sözleşme birkaç belirsiz madde içeriyordu.',
            turkishTranslation: 'Belirsiz, muğlak',
            type: 'adjective',
            level: 'B2',
            category: 'Akademik',
        },
        {
            word: 'alleviate',
            definitionTr: 'Acıyı, sıkıntıyı veya bir sorunu hafifletmek veya azaltmak.',
            exampleSentence: 'The medicine helped alleviate her chronic pain.',
            exampleSentenceTr: 'İlaç kronik ağrısını hafifletmeye yardımcı oldu.',
            turkishTranslation: 'Hafifletmek, azaltmak',
            type: 'verb',
            level: 'B2',
            category: 'Sağlık',
        },
        {
            word: 'pragmatic',
            definitionTr: 'İşleri mantıklı ve gerçekçi bir şekilde ele alan; pratik düşünen.',
            exampleSentence: 'We need to take a more pragmatic approach to this problem.',
            exampleSentenceTr: 'Bu soruna daha pragmatik bir yaklaşım benimsememiz gerekiyor.',
            turkishTranslation: 'Pragmatik, pratik',
            type: 'adjective',
            level: 'B2',
            category: 'İş',
        },
        {
            word: 'eloquent',
            definitionTr: 'Konuşmada veya yazıda akıcı ve ikna edici olan.',
            exampleSentence: 'She gave an eloquent speech that moved the audience to tears.',
            exampleSentenceTr: 'Dinleyicileri gözyaşlarına boğan etkili bir konuşma yaptı.',
            turkishTranslation: 'Etkili konuşan, güzel söz söyleyen',
            type: 'adjective',
            level: 'C1',
            category: 'Akademik',
        },
        {
            word: 'perseverance',
            definitionTr: 'Zorluklara veya gecikmelere rağmen bir şeyi yapmaya devam etme kararlılığı.',
            exampleSentence: 'His perseverance in the face of adversity was truly inspiring.',
            exampleSentenceTr: 'Zorluklara rağmen gösterdiği azim gerçekten ilham vericiydi.',
            turkishTranslation: 'Azim, sebat',
            type: 'noun',
            level: 'B2',
            category: 'Genel',
        },
        {
            word: 'collaborate',
            definitionTr: 'Bir faaliyet veya proje üzerinde başkalarıyla birlikte çalışmak.',
            exampleSentence: 'The two companies decided to collaborate on the research project.',
            exampleSentenceTr: 'İki şirket araştırma projesinde işbirliği yapmaya karar verdi.',
            turkishTranslation: 'İşbirliği yapmak',
            type: 'verb',
            level: 'B1',
            category: 'İş',
        },
        {
            word: 'spontaneous',
            definitionTr: 'Planlama yapmadan ani bir dürtüyle gerçekleştirilen veya meydana gelen.',
            exampleSentence: 'The crowd broke into spontaneous applause.',
            exampleSentenceTr: 'Kalabalık kendiliğinden alkışlamaya başladı.',
            turkishTranslation: 'Kendiliğinden, doğal',
            type: 'adjective',
            level: 'B2',
            category: 'Genel',
        },
        {
            word: 'consequence',
            definitionTr: 'Bir eylemin veya durumun sonucu veya etkisi.',
            exampleSentence: 'He understood the consequences of his decision.',
            exampleSentenceTr: 'Kararının sonuçlarını anladı.',
            turkishTranslation: 'Sonuç, netice',
            type: 'noun',
            level: 'B1',
            category: 'Genel',
        },
        // Additional words for variety
        {
            word: 'negotiate',
            definitionTr: 'Bir anlaşmaya varmak için pazarlık yapmak veya görüşmek.',
            exampleSentence: 'They need to negotiate a new contract with the supplier.',
            exampleSentenceTr: 'Tedarikçi ile yeni bir sözleşme için görüşmeleri gerekiyor.',
            turkishTranslation: 'Müzakere etmek, pazarlık yapmak',
            type: 'verb',
            level: 'B1',
            category: 'İş',
        },
        {
            word: 'accommodate',
            definitionTr: 'Birine yer sağlamak veya ihtiyaçlarına uyum sağlamak.',
            exampleSentence: 'The hotel can accommodate up to 500 guests.',
            exampleSentenceTr: 'Otel 500 misafire kadar konaklama sağlayabilir.',
            turkishTranslation: 'Barındırmak, uyum sağlamak',
            type: 'verb',
            level: 'B2',
            category: 'Seyahat',
        },
        {
            word: 'itinerary',
            definitionTr: 'Seyahat planı veya gidilecek yerlerin listesi.',
            exampleSentence: 'Our itinerary includes visits to three major cities.',
            exampleSentenceTr: 'Seyahat planımız üç büyük şehre ziyareti içeriyor.',
            turkishTranslation: 'Seyahat planı, güzergah',
            type: 'noun',
            level: 'B2',
            category: 'Seyahat',
        },
        {
            word: 'innovative',
            definitionTr: 'Yeni fikirler, yöntemler veya ürünler ortaya koyan.',
            exampleSentence: 'The company is known for its innovative products.',
            exampleSentenceTr: 'Şirket yenilikçi ürünleriyle tanınıyor.',
            turkishTranslation: 'Yenilikçi',
            type: 'adjective',
            level: 'B1',
            category: 'Teknoloji',
        },
        {
            word: 'implement',
            definitionTr: 'Bir planı, kararı veya fikri uygulamaya koymak.',
            exampleSentence: 'The government plans to implement new regulations next month.',
            exampleSentenceTr: 'Hükümet gelecek ay yeni düzenlemeleri uygulamaya koymayı planlıyor.',
            turkishTranslation: 'Uygulamak, hayata geçirmek',
            type: 'verb',
            level: 'B2',
            category: 'İş',
        },
    ];

    for (const wordData of words) {
        await prisma.word.upsert({
            where: { id: wordData.word }, // Use word as temp unique identifier
            update: wordData,
            create: wordData,
        });
    }

    console.log(`✅ Created ${words.length} words`);

    // Create achievements
    const achievements = [
        {
            name: 'first_word',
            nameTr: 'İlk Adım',
            description: 'Learn your first word',
            descriptionTr: 'İlk kelimeni öğren',
            icon: '🎯',
            xpReward: 50,
            condition: JSON.stringify({ wordsLearned: 1 }),
        },
        {
            name: 'streak_7',
            nameTr: '7 Gün Seri',
            description: 'Maintain a 7-day study streak',
            descriptionTr: '7 gün üst üste çalış',
            icon: '🔥',
            xpReward: 200,
            condition: JSON.stringify({ streak: 7 }),
        },
        {
            name: 'streak_30',
            nameTr: '30 Gün Ustası',
            description: 'Maintain a 30-day study streak',
            descriptionTr: '30 gün üst üste çalış',
            icon: '💪',
            xpReward: 1000,
            condition: JSON.stringify({ streak: 30 }),
        },
        {
            name: 'words_100',
            nameTr: '100 Kelime',
            description: 'Learn 100 words',
            descriptionTr: '100 kelime öğren',
            icon: '💯',
            xpReward: 500,
            condition: JSON.stringify({ wordsLearned: 100 }),
        },
        {
            name: 'perfectionist',
            nameTr: 'Mükemmeliyetçi',
            description: 'Complete a session with 100% accuracy',
            descriptionTr: 'Bir oturumu %100 doğrulukla tamamla',
            icon: '⭐',
            xpReward: 150,
            condition: JSON.stringify({ perfectSession: true }),
        },
        {
            name: 'speed_demon',
            nameTr: 'Hız Şeytanı',
            description: 'Complete 10 words in under 2 minutes',
            descriptionTr: '10 kelimeyi 2 dakikadan az sürede tamamla',
            icon: '⚡',
            xpReward: 200,
            condition: JSON.stringify({ speedRun: true }),
        },
        {
            name: 'night_owl',
            nameTr: 'Gece Kuşu',
            description: 'Study after midnight',
            descriptionTr: 'Gece yarısından sonra çalış',
            icon: '🦉',
            xpReward: 100,
            condition: JSON.stringify({ nightStudy: true }),
        },
        {
            name: 'early_bird',
            nameTr: 'Erken Kalkan',
            description: 'Study before 7 AM',
            descriptionTr: 'Sabah 7den önce çalış',
            icon: '🌅',
            xpReward: 100,
            condition: JSON.stringify({ earlyStudy: true }),
        },
    ];

    for (const achievement of achievements) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement,
        });
    }

    console.log(`✅ Created ${achievements.length} achievements`);
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
