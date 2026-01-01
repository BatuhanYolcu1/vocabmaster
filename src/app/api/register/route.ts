import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Starter word list - reduced for serverless performance
const WELCOME_WORDS = [
    { word: 'hello', translation: 'merhaba', example: 'Hello, how are you?' },
    { word: 'goodbye', translation: 'hoşça kal', example: 'Goodbye, see you tomorrow!' },
    { word: 'thank you', translation: 'teşekkür ederim', example: 'Thank you for your help.' },
    { word: 'please', translation: 'lütfen', example: 'Please sit down.' },
    { word: 'yes', translation: 'evet', example: 'Yes, I understand.' },
    { word: 'no', translation: 'hayır', example: 'No, thank you.' },
    { word: 'water', translation: 'su', example: 'Can I have some water?' },
    { word: 'friend', translation: 'arkadaş', example: 'She is my best friend.' },
    { word: 'family', translation: 'aile', example: 'I love my family.' },
    { word: 'house', translation: 'ev', example: 'This is my house.' },
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

        // Create user first
        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                password: hashedPassword,
                xp: 0,
                level: 1,
                streak: 0,
            },
        });

        // Create welcome word list (separate operation, no transaction)
        try {
            const wordList = await prisma.wordList.create({
                data: {
                    name: '🎉 Hoş Geldin Paketi',
                    description: 'İngilizce öğrenmeye başlamak için temel 10 kelime!',
                    userId: newUser.id,
                },
            });

            // Create words in parallel for speed
            const wordPromises = WELCOME_WORDS.map(w =>
                prisma.word.create({
                    data: {
                        word: w.word,
                        turkishTranslation: w.translation,
                        definitionTr: w.translation,
                        exampleSentence: w.example,
                        exampleSentenceTr: '',
                        type: 'noun',
                        level: 'A1',
                        category: 'Temel',
                        isSystem: false,
                        createdByUserId: newUser.id,
                    },
                })
            );

            const words = await Promise.all(wordPromises);

            // Link words to list in parallel
            const linkPromises = words.map(word =>
                prisma.wordListItem.create({
                    data: {
                        wordListId: wordList.id,
                        wordId: word.id,
                    },
                })
            );

            await Promise.all(linkPromises);
        } catch (wordError) {
            // If word list creation fails, user is still created successfully
            console.error('Welcome pack creation failed:', wordError);
        }

        return NextResponse.json(
            { message: 'Kullanıcı başarıyla oluşturuldu', userId: newUser.id },
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
