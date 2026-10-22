'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { SITE } from '@/lib/constants';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[70dvh] place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-muted">Beklenmedik bir hata oluştu. İlerlemen güvende; sayfayı yeniden denemen genellikle yeterli.</p>
        <div className="mt-7 flex justify-center gap-2">
          <Button onClick={reset}>Tekrar dene</Button>
          <ButtonLink href="/dashboard" variant="secondary">
            Panele dön
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-subtle">
            Sorun devam ederse bu kodla bize yaz: <code className="font-mono">{error.digest}</code> · {SITE.supportEmail}
          </p>
        )}
      </div>
    </main>
  );
}
