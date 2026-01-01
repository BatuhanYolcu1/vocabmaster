import { Word, UserProgress } from '@/types';

// 10 high-quality B1/B2 English words with Turkish definitions and example translations
export const words: Word[] = [
    {
        id: '1',
        word: 'resilient',
        definitionTr: 'Zorluklardan hızla toparlanabilen; güçlü ve uyum sağlayabilen.',
        exampleSentence: 'Children are often more resilient than adults give them credit for.',
        exampleSentenceTr: 'Çocuklar genellikle yetişkinlerin düşündüğünden daha dayanıklıdır.',
        turkishTranslation: 'Dayanıklı, esnek',
        type: 'adjective',
    },
    {
        id: '2',
        word: 'scrutinize',
        definitionTr: 'Dikkatli ve ayrıntılı bir şekilde incelemek veya gözden geçirmek.',
        exampleSentence: 'The detective scrutinized every piece of evidence.',
        exampleSentenceTr: 'Dedektif her kanıtı dikkatle inceledi.',
        turkishTranslation: 'İncelemek, gözden geçirmek',
        type: 'verb',
    },
    {
        id: '3',
        word: 'ambiguous',
        definitionTr: 'Birden fazla anlama gelebilen; net veya kesin olmayan.',
        exampleSentence: 'The contract contained several ambiguous clauses.',
        exampleSentenceTr: 'Sözleşme birkaç belirsiz madde içeriyordu.',
        turkishTranslation: 'Belirsiz, muğlak',
        type: 'adjective',
    },
    {
        id: '4',
        word: 'alleviate',
        definitionTr: 'Acıyı, sıkıntıyı veya bir sorunu hafifletmek veya azaltmak.',
        exampleSentence: 'The medicine helped alleviate her chronic pain.',
        exampleSentenceTr: 'İlaç kronik ağrısını hafifletmeye yardımcı oldu.',
        turkishTranslation: 'Hafifletmek, azaltmak',
        type: 'verb',
    },
    {
        id: '5',
        word: 'pragmatic',
        definitionTr: 'İşleri mantıklı ve gerçekçi bir şekilde ele alan; pratik düşünen.',
        exampleSentence: 'We need to take a more pragmatic approach to this problem.',
        exampleSentenceTr: 'Bu soruna daha pragmatik bir yaklaşım benimsememiz gerekiyor.',
        turkishTranslation: 'Pragmatik, pratik',
        type: 'adjective',
    },
    {
        id: '6',
        word: 'eloquent',
        definitionTr: 'Konuşmada veya yazıda akıcı ve ikna edici olan.',
        exampleSentence: 'She gave an eloquent speech that moved the audience to tears.',
        exampleSentenceTr: 'Dinleyicileri gözyaşlarına boğan etkili bir konuşma yaptı.',
        turkishTranslation: 'Etkili konuşan, güzel söz söyleyen',
        type: 'adjective',
    },
    {
        id: '7',
        word: 'perseverance',
        definitionTr: 'Zorluklara veya gecikmelere rağmen bir şeyi yapmaya devam etme kararlılığı.',
        exampleSentence: 'His perseverance in the face of adversity was truly inspiring.',
        exampleSentenceTr: 'Zorluklara rağmen gösterdiği azim gerçekten ilham vericiydi.',
        turkishTranslation: 'Azim, sebat',
        type: 'noun',
    },
    {
        id: '8',
        word: 'collaborate',
        definitionTr: 'Bir faaliyet veya proje üzerinde başkalarıyla birlikte çalışmak.',
        exampleSentence: 'The two companies decided to collaborate on the research project.',
        exampleSentenceTr: 'İki şirket araştırma projesinde işbirliği yapmaya karar verdi.',
        turkishTranslation: 'İşbirliği yapmak',
        type: 'verb',
    },
    {
        id: '9',
        word: 'spontaneous',
        definitionTr: 'Planlama yapmadan ani bir dürtüyle gerçekleştirilen veya meydana gelen.',
        exampleSentence: 'The crowd broke into spontaneous applause.',
        exampleSentenceTr: 'Kalabalık kendiliğinden alkışlamaya başladı.',
        turkishTranslation: 'Kendiliğinden, doğal',
        type: 'adjective',
    },
    {
        id: '10',
        word: 'consequence',
        definitionTr: 'Bir eylemin veya durumun sonucu veya etkisi.',
        exampleSentence: 'He understood the consequences of his decision.',
        exampleSentenceTr: 'Kararının sonuçlarını anladı.',
        turkishTranslation: 'Sonuç, netice',
        type: 'noun',
    },
];

// Simulated user progress
export const userProgress: UserProgress = {
    wordsToReview: 5,
    wordsLearned: 12,
    dailyGoal: 10,
    streak: 7,
};

// Get words for study session
export function getWordsForSession(count: number = 10): Word[] {
    return words.slice(0, count);
}
