'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Check, LogOut, Sparkles } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { Avatar, Chip } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';
import { ThemeSwitcher } from '@/components/theme';
import { api, errorMessage } from '@/lib/fetcher';
import { CATEGORY_INFO, CEFR_INFO, CEFR_LEVELS, DAILY_GOAL_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const AVATARS = ['Felix', 'Aneka', 'Luna', 'Milo', 'Zoe', 'Kai', 'Nova', 'Atlas'].map(
  (seed) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c0d4ff,d5ccff,ffd8c2,c6f0d8`,
);

const INTERESTS = ['Genel', 'İş', 'Akademik', 'Seyahat', 'Teknoloji', 'Sağlık'];

interface Props {
  user: {
    name: string;
    email: string;
    image: string | null;
    languageLevel: string;
    dailyGoal: number;
    interests: string[];
    hasPassword: boolean;
  };
  plan: { plan: 'FREE' | 'PRO'; endsAt: string | null; aiUsedToday: number; aiLimit: number | null };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function SettingsView({ user, plan }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { update } = useSession();

  const [profile, setProfile] = useState({ name: user.name, image: user.image });
  const [savingProfile, setSavingProfile] = useState(false);

  const [learning, setLearning] = useState({ languageLevel: user.languageLevel, dailyGoal: user.dailyGoal, interests: user.interests });
  const [savingLearning, setSavingLearning] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [del, setDel] = useState({ confirm: '', password: '' });
  const [deleting, setDeleting] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api('/api/profile', { method: 'PATCH', body: { name: profile.name, image: profile.image ?? '' } });
      await update({ name: profile.name, image: profile.image });
      toast.success('Profil güncellendi');
      router.refresh();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveLearning() {
    if (learning.interests.length === 0) {
      toast.error('En az bir ilgi alanı seç');
      return;
    }
    setSavingLearning(true);
    try {
      await api('/api/profile', { method: 'PATCH', body: learning });
      toast.success('Tercihlerin kaydedildi', 'Yeni kelimeler bu tercihlere göre seçilecek.');
      router.refresh();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setSavingLearning(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api('/api/profile/password', { method: 'PATCH', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      toast.success(user.hasPassword ? 'Şifren değiştirildi' : 'Şifren oluşturuldu');
      router.refresh();
    } catch (error) {
      toast.error('Şifre kaydedilemedi', errorMessage(error));
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api('/api/profile', { method: 'DELETE', body: del });
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error('Hesap silinemedi', errorMessage(error));
      setDeleting(false);
    }
  }

  const learningDirty =
    learning.languageLevel !== user.languageLevel ||
    learning.dailyGoal !== user.dailyGoal ||
    learning.interests.join() !== user.interests.join();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Section title="Profil">
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={profile.name} image={profile.image} size={64} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{profile.name || 'Adın'}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
              </div>
            </div>
            <Field label="Adın">
              {(p) => <Input {...p} value={profile.name} maxLength={50} onChange={(e) => setProfile((x) => ({ ...x, name: e.target.value }))} />}
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Avatar</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setProfile((x) => ({ ...x, image: null }))}
                  aria-pressed={!profile.image}
                  className={cn('rounded-full ring-2 ring-offset-2 ring-offset-surface', !profile.image ? 'ring-primary' : 'ring-transparent')}
                  title="Baş harfler"
                >
                  <Avatar name={profile.name} size={44} />
                </button>
                {AVATARS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setProfile((x) => ({ ...x, image: url }))}
                    aria-pressed={profile.image === url}
                    className={cn('rounded-full ring-2 ring-offset-2 ring-offset-surface', profile.image === url ? 'ring-primary' : 'ring-transparent')}
                  >
                    <Avatar name={profile.name} image={url} size={44} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={savingProfile} disabled={profile.name.trim().length < 2}>
                Profili kaydet
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Öğrenme tercihleri" description="Günlük çalışmada karşına çıkacak yeni kelimeler bunlara göre seçilir.">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="İngilizce seviyen">
                {(p) => (
                  <Select {...p} value={learning.languageLevel} onChange={(e) => setLearning((l) => ({ ...l, languageLevel: e.target.value }))}>
                    {CEFR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l} — {CEFR_INFO[l].label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Günlük hedef">
                {(p) => (
                  <Select {...p} value={learning.dailyGoal} onChange={(e) => setLearning((l) => ({ ...l, dailyGoal: Number(e.target.value) }))}>
                    {[...new Set([...DAILY_GOAL_OPTIONS.map((o) => o.value), learning.dailyGoal])]
                      .sort((a, b) => a - b)
                      .map((v) => (
                        <option key={v} value={v}>
                          Günde {v} kelime
                        </option>
                      ))}
                  </Select>
                )}
              </Field>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">İlgi alanların</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = learning.interests.includes(i);
                  return (
                    <Chip
                      key={i}
                      active={on}
                      onClick={() =>
                        setLearning((l) => ({ ...l, interests: on ? l.interests.filter((x) => x !== i) : [...l.interests, i] }))
                      }
                    >
                      {on && <Check className="size-3.5" />}
                      {CATEGORY_INFO[i]?.label ?? i}
                    </Chip>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveLearning} loading={savingLearning} disabled={!learningDirty}>
                Tercihleri kaydet
              </Button>
            </div>
          </div>
        </Section>

        <Section title={user.hasPassword ? 'Şifreyi değiştir' : 'Şifre oluştur'} description={user.hasPassword ? undefined : 'Google ile giriş yapıyorsun. İstersen e-postanla da giriş yapabilmek için bir şifre belirle.'}>
          <form onSubmit={savePassword} className="space-y-4">
            <input type="email" autoComplete="username" value={user.email} readOnly hidden />
            {user.hasPassword && (
              <Field label="Mevcut şifre">
                {(p) => (
                  <Input {...p} type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw((x) => ({ ...x, currentPassword: e.target.value }))} />
                )}
              </Field>
            )}
            <Field label="Yeni şifre" hint="En az 8 karakter.">
              {(p) => <Input {...p} type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw((x) => ({ ...x, newPassword: e.target.value }))} />}
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={savingPw} disabled={pw.newPassword.length < 8 || (user.hasPassword && !pw.currentPassword)}>
                {user.hasPassword ? 'Şifreyi değiştir' : 'Şifreyi kaydet'}
              </Button>
            </div>
          </form>
        </Section>

        <Card className="border-danger/30">
          <CardHeader title="Hesabı sil" description="Tüm listelerin, ilerlemen ve istatistiklerin kalıcı olarak silinir. Bu işlem geri alınamaz." />
          <CardBody>
            <Button variant="danger-soft" onClick={() => setDeleteOpen(true)}>
              Hesabımı sil
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Planın" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={cn('grid size-10 place-items-center rounded-xl', plan.plan === 'PRO' ? 'bg-violet-soft text-violet' : 'bg-surface-2 text-muted')}>
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{plan.plan === 'PRO' ? 'Pro' : 'Ücretsiz'}</p>
                <p className="text-sm text-muted">
                  {plan.plan === 'PRO'
                    ? plan.endsAt
                      ? `${new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(plan.endsAt))} tarihine kadar`
                      : 'Süresiz'
                    : 'Temel özellikler sınırsız'}
                </p>
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted">Bugünkü AI kullanımı</span>
                <span className="tabular font-medium">
                  {plan.aiUsedToday}
                  {plan.aiLimit !== null ? `/${plan.aiLimit}` : ''}
                </span>
              </div>
              {plan.aiLimit !== null && <ProgressBar value={plan.aiUsedToday} max={plan.aiLimit} tone="xp" label="AI kullanımı" />}
            </div>
            {plan.plan !== 'PRO' && (
              <ButtonLink href="/pricing" variant="soft" className="w-full">
                Pro’yu incele
              </ButtonLink>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Görünüm" />
          <CardBody>
            <ThemeSwitcher className="w-full justify-between [&>button]:flex-1 [&>button]:justify-center" />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3 text-sm">
            <Link href="/privacy" className="block text-muted hover:text-fg">
              Gizlilik politikası
            </Link>
            <Link href="/terms" className="block text-muted hover:text-fg">
              Kullanım koşulları
            </Link>
            <Link href="/contact" className="block text-muted hover:text-fg">
              Destek ve iletişim
            </Link>
            <Button variant="secondary" className="mt-2 w-full" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut /> Çıkış yap
            </Button>
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Hesabın kalıcı olarak silinsin mi?"
        description="Bu işlem geri alınamaz."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={deleteAccount}
              loading={deleting}
              disabled={del.confirm.trim().toLocaleLowerCase('tr-TR') !== 'hesabımı sil' || (user.hasPassword && !del.password)}
            >
              Kalıcı olarak sil
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={<>Onaylamak için <strong>hesabımı sil</strong> yaz</>}>
            {(p) => <Input {...p} value={del.confirm} onChange={(e) => setDel((d) => ({ ...d, confirm: e.target.value }))} autoComplete="off" />}
          </Field>
          {user.hasPassword && (
            <Field label="Şifren">
              {(p) => <Input {...p} type="password" autoComplete="current-password" value={del.password} onChange={(e) => setDel((d) => ({ ...d, password: e.target.value }))} />}
            </Field>
          )}
        </div>
      </Dialog>
    </div>
  );
}
