'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { GoogleButton } from '../google-button';
import { SITE } from '@/lib/constants';

const ERRORS: Record<string, string> = {
  CredentialsSignin: 'E-posta ya da şifre hatalı.',
  OAuthAccountNotLinked: 'Bu e-posta başka bir giriş yöntemiyle kayıtlı.',
  AccessDenied: 'Giriş izni verilmedi.',
};

function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export function LoginForm({ googleEnabled, initialError, next }: { googleEnabled: boolean; initialError?: string; next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ? ERRORS[initialError] ?? 'Giriş yapılamadı. Tekrar dene.' : '');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (!res || res.error) {
      setLoading(false);
      setError(ERRORS.CredentialsSignin);
      return;
    }
    router.replace(safeNext(next));
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Tekrar hoş geldin</h1>
      <p className="mt-1.5 text-sm text-muted">Kaldığın yerden devam etmek için giriş yap.</p>

      {googleEnabled && (
        <>
          <GoogleButton className="mt-7" callbackUrl={safeNext(next)} />
          <div className="my-6 flex items-center gap-3 text-xs text-subtle">
            <div className="h-px flex-1 bg-border" /> ya da <div className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={googleEnabled ? 'space-y-4' : 'mt-7 space-y-4'} noValidate>
        <Field label="E-posta">
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@eposta.com"
            />
          )}
        </Field>
        <Field label="Şifre">
          {(p) => (
            <div className="relative">
              <Input
                {...p}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          )}
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!email || !password}>
          Giriş yap
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Hesabın yok mu?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Ücretsiz kaydol
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-subtle">
        Şifreni mi unuttun?{' '}
        <a href={`mailto:${SITE.supportEmail}?subject=Şifre sıfırlama`} className="underline hover:text-fg">
          Bize yaz
        </a>
        , hemen yardımcı olalım.
      </p>
    </div>
  );
}
