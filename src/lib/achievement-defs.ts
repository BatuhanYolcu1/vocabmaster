// Achievement definitions (shared by the app and the seed script).
// Names are stable keys: existing UserAchievement rows point at them.

export type AchievementMetric =
  | 'wordsLearned'
  | 'streak'
  | 'perfectSession'
  | 'speedRun'
  | 'nightStudy'
  | 'earlyStudy'
  | 'allCategories'
  | 'longSession'
  | 'level';

export interface AchievementDef {
  name: string;
  nameTr: string;
  descriptionTr: string;
  description: string;
  icon: string; // lucide icon key, mapped on the client
  xpReward: number;
  metric: AchievementMetric;
  target: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { name: 'first_word', nameTr: 'İlk Adım', descriptionTr: 'İlk kelimeni öğren.', description: 'Learn your first word', icon: 'sprout', xpReward: 50, metric: 'wordsLearned', target: 1 },
  { name: 'words_50', nameTr: '50 Kelime', descriptionTr: '50 kelimeyi kalıcı hafızaya taşı.', description: 'Learn 50 words', icon: 'book-open', xpReward: 300, metric: 'wordsLearned', target: 50 },
  { name: 'words_100', nameTr: 'Yüzlük', descriptionTr: '100 kelime öğren.', description: 'Learn 100 words', icon: 'library', xpReward: 500, metric: 'wordsLearned', target: 100 },
  { name: 'words_500', nameTr: 'Kelime Hazinesi', descriptionTr: '500 kelime öğren.', description: 'Learn 500 words', icon: 'gem', xpReward: 2000, metric: 'wordsLearned', target: 500 },
  { name: 'streak_7', nameTr: 'Bir Haftalık Seri', descriptionTr: '7 gün üst üste çalış.', description: 'Maintain a 7-day streak', icon: 'flame', xpReward: 200, metric: 'streak', target: 7 },
  { name: 'streak_30', nameTr: 'Aylık Disiplin', descriptionTr: '30 gün üst üste çalış.', description: 'Maintain a 30-day streak', icon: 'calendar-check', xpReward: 1000, metric: 'streak', target: 30 },
  { name: 'perfectionist', nameTr: 'Kusursuz', descriptionTr: 'En az 5 soruluk bir oturumu hatasız bitir.', description: 'Finish a session of 5+ answers with 100% accuracy', icon: 'target', xpReward: 150, metric: 'perfectSession', target: 1 },
  { name: 'speed_demon', nameTr: 'Şimşek', descriptionTr: '10 soruluk bir oturumu 2 dakikadan kısa sürede bitir.', description: 'Finish 10 answers in under 2 minutes', icon: 'zap', xpReward: 200, metric: 'speedRun', target: 1 },
  { name: 'night_owl', nameTr: 'Gece Kuşu', descriptionTr: 'Gece yarısından sonra çalış.', description: 'Study after midnight', icon: 'moon', xpReward: 100, metric: 'nightStudy', target: 1 },
  { name: 'early_bird', nameTr: 'Erkenci', descriptionTr: 'Sabah 7’den önce çalış.', description: 'Study before 7 AM', icon: 'sunrise', xpReward: 100, metric: 'earlyStudy', target: 1 },
  { name: 'polyglot', nameTr: 'Kâşif', descriptionTr: 'Kütüphanedeki her kategoriden kelime çalış.', description: 'Study words from every library category', icon: 'compass', xpReward: 500, metric: 'allCategories', target: 1 },
  { name: 'marathon', nameTr: 'Maratoncu', descriptionTr: 'Tek oturumda 50 soru cevapla.', description: 'Answer 50 questions in one session', icon: 'timer', xpReward: 300, metric: 'longSession', target: 1 },
  { name: 'level_10', nameTr: 'Onuncu Seviye', descriptionTr: '10. seviyeye ulaş.', description: 'Reach level 10', icon: 'crown', xpReward: 400, metric: 'level', target: 10 },
];
