'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme';
import { ToastProvider } from './ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
