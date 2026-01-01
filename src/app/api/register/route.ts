import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Starter word list - Most common English words for beginners
const WELCOME_WORDS = [
    { word: 'hello', definition: 'merhaba', example: 'Hello, how are you?' },
    { word: 'goodbye', definition: 'hoşça kal', example: 'Goodbye, see you tomorrow!' },
    { word: 'thank you', definition: 'teşekkür ederim', example: 'Thank you for your help.' },
    { word: 'please', definition: 'lütfen', example: 'Please sit down.' },
    { word: 'yes', definition: 'evet', example: 'Yes, I understand.' },
    { word: 'no', definition: 'hayır', example: 'No, thank you.' },
    { word: 'water', definition: 'su', example: 'Can I have some water?' },
    { word: 'food', definition: 'yiyecek', example: 'The food is delicious.' },
    { word: 'friend', definition: 'arkadaş', example: 'She is my best friend.' },
    { word: 'family', definition: 'aile', example: 'I love my family.' },
    { word: 'house', definition: 'ev', example: 'This is my house.' },
    { word: 'car', definition: 'araba', example: 'I bought a new car.' },
    { word: 'book', definition: 'kitap', example: 'I am reading a book.' },
    { word: 'school', definition: 'okul', example: 'I go to school every day.' },
    { word: 'work', definition: 'iş', example: 'I have a lot of work.' },
    { word: 'money', definition: 'para', example: 'I need more money.' },
    { word: 'time', definition: 'zaman', example: 'What time is it?' },
    { word: 'day', definition: 'gün', example: 'Have a nice day!' },
    { word: 'night', definition: 'gece', example: 'Good night!' },
    { word: 'love', definition: 'sevgi, aşk', example: 'I love you.' },
    { word: 'happy', definition: 'mutlu', example: 'I am very happy today.' },
    { word: 'sad', definition: 'üzgün', example: 'Why are you sad?' },
    { word: 'beautiful', definition: 'güzel', example: 'The sunset is beautiful.' },
    { word: 'big', definition: 'büyük', example: 'This is a big house.' },
    { word: 'small', definition: 'küçük', example: 'I have a small dog.' },
    { word: 'good', definition: 'iyi', example: 'This is a good idea.' },
    { word: 'bad', definition: 'kötü', example: 'That was a bad decision.' },
    { word: 'new', definition: 'yeni', example: 'I have a new phone.' },
    { word: 'old', definition: 'eski, yaşlı', example: 'This is an old building.' },
    { word: 'today', definition: 'bugün', example: 'What are you doing today?' },
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
            await tx.wordList.create({
                data: {
                    name: '🎉 Hoş Geldin Paketi',
                    description: 'İngilizce öğrenmeye başlamak için en temel 30 kelime!',
                    userId: newUser.id,
                    items: {
                        create: WELCOME_WORDS.map((w, index) => ({
                            word: w.word,
                            definition: w.definition,
                            example: w.example,
                            order: index,
                        })),
                    },
                },
            });

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
