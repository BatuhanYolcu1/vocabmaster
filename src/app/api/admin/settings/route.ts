import { z } from 'zod';
import { route, readJson, json, requireApiAdminId } from '@/server/api';
import { SETTING_KEYS, getSettings, setSetting } from '@/server/settings';

export const GET = route(async () => {
  await requireApiAdminId();
  return json(await getSettings());
});

export const PATCH = route(async (req) => {
  await requireApiAdminId();
  const { key, value } = await readJson(req, z.object({ key: z.enum(SETTING_KEYS), value: z.boolean() }));
  await setSetting(key, value);
  return json({ key, value });
});
