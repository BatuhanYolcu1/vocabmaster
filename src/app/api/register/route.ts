import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Starter word list - Most common English words for beginners
const WELCOME_WORDS = [
    { word: 'hello', translation: 'merhaba', example: 'Hello, how are you?', exampleTr: 'Merhaba, nasılsın?' },
    { word: 'goodbye', translation: 'hoşça kal', example: 'Goodbye, see you tomorrow!', exampleTr: 'Hoşça kal, yarın görüşürüz!' },
    { word: 'thank you', translation: 'teşekkür ederim', example: 'Thank you for your help.', exampleTr: 'Yardımın için teşekkürler.' },
    { word: 'please', translation: 'lütfen', example: 'Please sit down.', exampleTr: 'Lütfen oturun.' },
    { word: 'yes', translation: 'evet', example: 'Yes, I understand.', exampleTr: 'Evet, anlıyorum.' },
    { word: 'no', translation: 'hayır', example: 'No, thank you.', exampleTr: 'Hayır, teşekkürler.' },
    { word: 'water', translation: 'su', example: 'Can I have some water?', exampleTr: 'Biraz su alabilir miyim?' },
    { word: 'food', translation: 'yiyecek', example: 'The food is delicious.', exampleTr: 'Yemek lezzetli.' },
    { word: 'friend', translation: 'arkadaş', example: 'She is my best friend.', exampleTr: 'O benim en iyi arkadaşım.' },
    { word: 'family', translation: 'aile', example: 'I love my family.', exampleTr: 'Ailemi seviyorum.' },
    { word: 'house', translation: 'ev', example: 'This is my house.', exampleTr: 'Bu benim evim.' },
    { word: 'car', translation: 'araba', example: 'I bought a new car.', exampleTr: 'Yeni bir araba aldım.' },
    { word: 'book', translation: 'kitap', example: 'I am reading a book.', exampleTr: 'Bir kitap okuyorum.' },
    { word: 'school', translation: 'okul', example: 'I go to school every day.', exampleTr: 'Her gün okula gidiyorum.' },
    { word: 'work', translation: 'iş', example: 'I have a lot of work.', exampleTr: 'Çok işim var.' },
    { word: 'money', translation: 'para', example: 'I need more money.', exampleTr: 'Daha fazla paraya ihtiyacım var.' },
    { word: 'time', translation: 'zaman', example: 'What time is it?', exampleTr: 'Saat kaç?' },
    { word: 'day', translation: 'gün', example: 'Have a nice day!', exampleTr: 'İyi günler!' },
    { word: 'night', translation: 'gece', example: 'Good night!', exampleTr: 'İyi geceler!' },
    { word: 'love', translation: 'sevgi, aşk', example: 'I love you.', exampleTr: 'Seni seviyorum.' },
    { word: 'happy', translation: 'mutlu', example: 'I am very happy today.', exampleTr: 'Bugün çok mutluyum.' },
    { word: 'beautiful', translation: 'güzel', example: 'The sunset is beautiful.', exampleTr: 'Gün batımı güzel.' },
    { word: 'big', translation: 'büyük', example: 'This is a big house.', exampleTr: 'Bu büyük bir ev.' },
    { word: 'small', translation: 'küçük', example: 'I have a small dog.', exampleTr: 'Küçük bir köpeğim var.' },
    { word: 'good', translation: 'iyi', example: 'This is a good idea.', exampleTr: 'Bu iyi bir fikir.' },
    { word: 'new', translation: 'yeni', example: 'I have a new phone.', exampleTr: 'Yeni bir telefonum var.' },
    { word: 'today', translation: 'bugün', example: 'What are you doing today?', exampleTr: 'Bugün ne yapıyorsun?' },
];

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email ve şifre gereklidir' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Bu email ile kayıtlı kullanıcı zaten var' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with welcome word list in a transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    password: hashedPassword,
                    xp: 0,
                    level: 1,
                    streak: 0,
                },
            });

            // Create welcome word list
            const wordList = await tx.wordList.create({
                data: {
                    name: '🎉 Hoş Geldin Paketi',
                    description: 'İngilizce öğrenmeye başlamak için en temel 25 kelime!',
                    userId: newUser.id,
                },
            });

            // Create words and link them to the list
            for (const w of WELCOME_WORDS) {
                const word = await tx.word.create({
                    data: {
                        word: w.word,
                        turkishTranslation: w.translation,
                        definitionTr: w.translation,
                        exampleSentence: w.example,
                        exampleSentenceTr: w.exampleTr,
                        type: 'noun',
                        level: 'A1',
                        category: 'Temel',
                        isSystem: false,
                        createdByUserId: newUser.id,
                    },
                });

                await tx.wordListItem.create({
                    data: {
                        wordListId: wordList.id,
                        wordId: word.id,
                    },
                });
            }

            return newUser;
        });

        return NextResponse.json(
            { message: 'Kullanıcı başarıyla oluşturuldu', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Kayıt sırasında bir sunucu hatası oluştu' },
            { status: 500 }
        );
    }
}
