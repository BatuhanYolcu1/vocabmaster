import { PrismaClient } from '@prisma/client';
import WORDS from './word-data';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Seed words from compact data
    let wordCount = 0;
    for (const [category, words] of Object.entries(WORDS)) {
        for (const [word, turkishTranslation, type, level] of words) {
            await prisma.word.upsert({
                where: { id: word },
                update: { turkishTranslation, type, level, category },
                create: {
                    word,
                    turkishTranslation,
                    definitionTr: `${turkishTranslation} anlamına gelen ${type}.`,
                    exampleSentence: '',
                    exampleSentenceTr: '',
                    type,
                    level,
                    category,
                },
            });
            wordCount++;
        }
    }
    console.log(`✅ Created ${wordCount} words across ${Object.keys(WORDS).length} categories`);

    // Create achievements
    const achievements = [
        { name: 'first_word', nameTr: 'İlk Adım', description: 'Learn your first word', descriptionTr: 'İlk kelimeni öğren', icon: '🎯', xpReward: 50, condition: JSON.stringify({ wordsLearned: 1 }) },
        { name: 'streak_7', nameTr: '7 Gün Seri', description: 'Maintain a 7-day streak', descriptionTr: '7 gün üst üste çalış', icon: '🔥', xpReward: 200, condition: JSON.stringify({ streak: 7 }) },
        { name: 'streak_30', nameTr: '30 Gün Ustası', description: 'Maintain a 30-day streak', descriptionTr: '30 gün üst üste çalış', icon: '💪', xpReward: 1000, condition: JSON.stringify({ streak: 30 }) },
        { name: 'words_50', nameTr: '50 Kelime', description: 'Learn 50 words', descriptionTr: '50 kelime öğren', icon: '📚', xpReward: 300, condition: JSON.stringify({ wordsLearned: 50 }) },
        { name: 'words_100', nameTr: '100 Kelime', description: 'Learn 100 words', descriptionTr: '100 kelime öğren', icon: '💯', xpReward: 500, condition: JSON.stringify({ wordsLearned: 100 }) },
        { name: 'words_500', nameTr: '500 Kelime', description: 'Learn 500 words', descriptionTr: '500 kelime öğren', icon: '🏆', xpReward: 2000, condition: JSON.stringify({ wordsLearned: 500 }) },
        { name: 'perfectionist', nameTr: 'Mükemmeliyetçi', description: 'Complete a session with 100% accuracy', descriptionTr: '%100 doğrulukla tamamla', icon: '⭐', xpReward: 150, condition: JSON.stringify({ perfectSession: true }) },
        { name: 'speed_demon', nameTr: 'Hız Şeytanı', description: 'Complete 10 words in under 2 minutes', descriptionTr: '10 kelimeyi 2 dk altında tamamla', icon: '⚡', xpReward: 200, condition: JSON.stringify({ speedRun: true }) },
        { name: 'night_owl', nameTr: 'Gece Kuşu', description: 'Study after midnight', descriptionTr: 'Gece yarısından sonra çalış', icon: '🦉', xpReward: 100, condition: JSON.stringify({ nightStudy: true }) },
        { name: 'early_bird', nameTr: 'Erken Kalkan', description: 'Study before 7 AM', descriptionTr: 'Sabah 7den önce çalış', icon: '🌅', xpReward: 100, condition: JSON.stringify({ earlyStudy: true }) },
        { name: 'polyglot', nameTr: 'Çok Yönlü', description: 'Study all categories', descriptionTr: 'Tüm kategorilerde çalış', icon: '🌍', xpReward: 500, condition: JSON.stringify({ allCategories: true }) },
        { name: 'marathon', nameTr: 'Maraton', description: 'Study for 30+ minutes in one session', descriptionTr: 'Tek oturumda 30+ dk çalış', icon: '🏃', xpReward: 300, condition: JSON.stringify({ longSession: true }) },
    ];

    for (const a of achievements) {
        await prisma.achievement.upsert({ where: { name: a.name }, update: a, create: a });
    }
    console.log(`✅ Created ${achievements.length} achievements`);
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
