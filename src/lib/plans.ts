// Subscription plans. LITE exists in the database enum for legacy rows and is
// treated exactly like PRO.

export type Plan = 'FREE' | 'PRO';

export interface PlanLimits {
  dailyAiLimit: number; // Infinity = unlimited
  fileImport: boolean;
  storyMode: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { dailyAiLimit: 5, fileImport: false, storyMode: false, prioritySupport: false },
  PRO: { dailyAiLimit: Infinity, fileImport: true, storyMode: true, prioritySupport: true },
};

/** Monthly Pro price in TRY (unchanged from v2). */
export const PRO_MONTHLY_PRICE = 49.99;

export function normalizePlan(value: string | null | undefined): Plan {
  return value === 'PRO' || value === 'LITE' ? 'PRO' : 'FREE';
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(value);
}

export const PLAN_FEATURES: Array<{ label: string; free: boolean | string; pro: boolean | string }> = [
  { label: 'Sınırsız kelime ve liste', free: true, pro: true },
  { label: '7 çalışma modu + akıllı tekrar (SRS)', free: true, pro: true },
  { label: 'Seviyelere ayrılmış hazır kelime kütüphanesi', free: true, pro: true },
  { label: 'İstatistikler, seri ve başarımlar', free: true, pro: true },
  { label: 'AI ile kelime detayı üretme', free: 'Günde 5', pro: 'Sınırsız' },
  { label: 'AI hikâye modu', free: false, pro: true },
  { label: 'Excel / CSV ile toplu içe aktarma', free: false, pro: true },
  { label: 'Öncelikli destek', free: false, pro: true },
];
