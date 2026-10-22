'use client';

import { useEffect, useState } from 'react';
import { Bot, Construction, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/field';
import { PageHeader, Skeleton } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type Key = 'MAINTENANCE_MODE' | 'AI_ENABLED' | 'REGISTRATION_ENABLED';

const ITEMS: Array<{ key: Key; title: string; description: string; icon: typeof Bot; danger?: boolean }> = [
  { key: 'AI_ENABLED', title: 'Yapay zekâ özellikleri', description: 'Kapalıyken AI ile doldurma, metinden kelime çıkarma ve hikâye modu devre dışı kalır.', icon: Bot },
  { key: 'REGISTRATION_ENABLED', title: 'Yeni kayıtlar', description: 'Kapalıyken kayıt sayfası yeni üyelik kabul etmez. Mevcut kullanıcılar giriş yapabilir.', icon: UserPlus },
  {
    key: 'MAINTENANCE_MODE',
    title: 'Bakım modu',
    description: 'Açıkken adminler dışında herkes bakım ekranını görür. Giriş sayfası açık kalır.',
    icon: Construction,
    danger: true,
  },
];

export default function AdminSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<Record<Key, boolean> | null>(null);
  const [saving, setSaving] = useState<Key | null>(null);

  useEffect(() => {
    api<Record<Key, boolean>>('/api/admin/settings')
      .then(setSettings)
      .catch((e) => toast.error('Ayarlar yüklenemedi', errorMessage(e)));
  }, [toast]);

  async function change(key: Key, value: boolean) {
    setSaving(key);
    try {
      await api('/api/admin/settings', { method: 'PATCH', body: { key, value } });
      setSettings((s) => (s ? { ...s, [key]: value } : s));
      toast.success('Ayar kaydedildi');
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <PageHeader title="Sistem ayarları" description="Değişiklikler anında tüm kullanıcılar için geçerli olur." />
      <Card>
        <ul className="divide-y divide-border">
          {ITEMS.map(({ key, title, description, icon: Icon, danger }) => (
            <li key={key} className="flex items-start gap-4 px-5 py-5">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', danger ? 'bg-warning-soft text-warning' : 'bg-surface-2 text-muted')}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{description}</p>
              </div>
              {settings ? (
                <Switch checked={settings[key]} onChange={(v) => change(key, v)} disabled={saving === key} label={title} />
              ) : (
                <Skeleton className="h-6 w-11 rounded-full" />
              )}
            </li>
          ))}
        </ul>
      </Card>
      <p className="mt-4 text-sm text-muted">
        Plan limitleri (ör. ücretsiz plandaki günlük AI hakkı) <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">src/lib/plans.ts</code> dosyasında tanımlıdır.
      </p>
    </>
  );
}
