import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { googleEnabled } from '@/server/auth';
import { getSettings } from '@/server/settings';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Kaydol' };

export default async function RegisterPage() {
  const settings = await getSettings();
  if (!settings.REGISTRATION_ENABLED) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Kayıtlar şu an kapalı</h1>
        <p className="mt-2 text-sm text-muted">Yeni üyelikleri kısa bir süreliğine durdurduk. Lütfen daha sonra tekrar dene.</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Zaten hesabın var mı? Giriş yap
        </Link>
      </div>
    );
  }
  return <RegisterForm googleEnabled={googleEnabled} />;
}
