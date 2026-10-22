import type { Metadata } from 'next';
import { googleEnabled } from '@/server/auth';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Giriş yap' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return <LoginForm googleEnabled={googleEnabled} initialError={error} next={next} />;
}
