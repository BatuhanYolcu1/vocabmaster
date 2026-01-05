// src/lib/wordBankIndex.ts
// Merkezi kelime bankası index dosyası

import { generalWords, WordData } from './wordBank';
import { businessWords } from './wordBankBusiness';
import { travelWords } from './wordBankTravel';
import { academicWords } from './wordBankAcademic';
import { techWords } from './wordBankTech';
import { healthWords } from './wordBankHealth';

export type { WordData };

// Kategori slug'larına göre kelime eşleştirmesi
export const wordBankByCategory: Record<string, WordData[]> = {
    general: generalWords,      // Genel
    business: businessWords,    // İş Dünyası
    travel: travelWords,        // Seyahat
    academic: academicWords,    // Akademik
    technology: techWords,      // Teknoloji
    health: healthWords,        // Sağlık
};

// Kategori kelime sayılarını al
export function getCategoryWordCounts(): Record<string, number> {
    return {
        general: generalWords.length,
        business: businessWords.length,
        travel: travelWords.length,
        academic: academicWords.length,
        technology: techWords.length,
        health: healthWords.length,
    };
}

// Belirli kategorinin kelimelerini al
export function getWordsByCategory(categorySlug: string): WordData[] {
    return wordBankByCategory[categorySlug] || [];
}

// Tüm kelimeleri al
export function getAllWords(): WordData[] {
    return [
        ...generalWords,
        ...businessWords,
        ...travelWords,
        ...academicWords,
        ...techWords,
        ...healthWords,
    ];
}

// Toplam kelime sayısı
export function getTotalWordCount(): number {
    return getAllWords().length;
}
