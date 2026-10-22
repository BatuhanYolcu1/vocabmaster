'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { GoogleButton } from '../google-button';
import { api, errorMessage } from '@/lib/fetcher';
import { registerSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof typeof form] ??= issue.message;
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      await api('/api/register', { method: 'POST', body: parsed.data });
      const res = await signIn('credentials', { email: parsed.data.email, password: parsed.data.password, redirect: false });
      if (!res || res.error) throw new Error('Hesabın oluşturuldu ama giriş yapılamadı. Lütfen giriş sayfasını dene.');
      router.replace('/onboarding');
      router.refresh();
    } catch (error) {
      setFormError(errorMessage(error));
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Ücretsiz hesap oluştur</h1>
      <p className="mt-1.5 text-sm text-muted">Kredi kartı gerekmez. 1 dakikada başla.</p>

      {googleEnabled && (
        <>
          <GoogleButton className="mt-7" callbackUrl="/onboarding" />
          <div className="my-6 flex items-center gap-3 text-xs text-subtle">
            <div className="h-px flex-1 bg-border" /> ya da e-postayla <div className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={googleEnabled ? 'space-y-4' : 'mt-7 space-y-4'} noValidate>
        <Field label="Adın" error={errors.name}>
          {(p) => <Input {...p} autoComplete="name" value={form.name} onChange={set('name')} placeholder="Adın Soyadın" />}
        </Field>
        <Field label="E-posta" error={errors.email}>
          {(p) => (
            <Input {...p} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="ornek@eposta.com" />
          )}
        </Field>
        <Field label="Şifre" error={errors.password} hint={!errors.password ? 'En az 8 karakter.' : undefined}>
          {(p) => (
            <div>
              <div className="relative">
                <Input
                  {...p}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-subtle hover:text-fg"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-1" aria-hidden>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        strength >= i ? (strength === 1 ? 'bg-danger' : strength === 2 ? 'bg-warning' : 'bg-success') : 'bg-surface-3',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Field>

        {formError && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Hesabımı oluştur
        </Button>
        <p className="text-center text-xs leading-relaxed text-subtle">
          Kaydolarak{' '}
          <Link href="/terms" className="underline hover:text-fg">
            Kullanım Koşulları
          </Link>{' '}
          ve{' '}
          <Link href="/privacy" className="underline hover:text-fg">
            Gizlilik Politikası
          </Link>
          ’nı kabul etmiş olursun.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
