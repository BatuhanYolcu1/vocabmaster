import 'server-only';
import { prisma } from './db';

export const SETTING_KEYS = ['MAINTENANCE_MODE', 'AI_ENABLED', 'REGISTRATION_ENABLED'] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

const DEFAULTS: Record<SettingKey, boolean> = {
  MAINTENANCE_MODE: false,
  AI_ENABLED: true,
  REGISTRATION_ENABLED: true,
};

// Read on every request (the root layout checks maintenance mode), so keep a short
// in-memory copy. Changes made through setSetting are visible immediately on this
// instance and within TTL_MS everywhere else.
const TTL_MS = 30_000;
let cache: { value: Record<SettingKey, boolean>; at: number } | null = null;

export async function getSettings(): Promise<Record<SettingKey, boolean>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const result = { ...DEFAULTS };
  try {
    const rows = await prisma.systemSetting.findMany({ where: { key: { in: [...SETTING_KEYS] } } });
    for (const row of rows) result[row.key as SettingKey] = row.value === 'true';
    cache = { value: result, at: Date.now() };
  } catch (error) {
    console.error('[settings] falling back to defaults', error);
  }
  return result;
}

export async function setSetting(key: SettingKey, value: boolean) {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
  cache = null;
}
