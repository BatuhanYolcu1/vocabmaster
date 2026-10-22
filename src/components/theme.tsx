'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'vm-theme';
const CHANGE_EVENT = 'vm-theme-change';

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {}
  return 'system';
}

function subscribePreference(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function subscribeSystem(onChange: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => 'system' as const);
  const dark = useSyncExternalStore(subscribeSystem, systemDark, () => false);
  const resolved: 'light' | 'dark' = preference === 'dark' || (preference === 'system' && dark) ? 'dark' : 'light';

  // The inline script in <head> already set the class before paint; keep it in sync afterwards.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  const setPreference = useCallback((p: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return <ThemeContext.Provider value={{ preference, resolved, setPreference }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Açık', icon: Sun },
  { value: 'dark', label: 'Koyu', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
];

export function ThemeSwitcher({ className, compact }: { className?: string; compact?: boolean }) {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Tema" className={cn('inline-flex rounded-lg bg-surface-2 p-0.5', className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          title={label}
          onClick={() => setPreference(value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-fg',
            preference === value && 'bg-surface text-fg shadow-sm',
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          {!compact && label}
        </button>
      ))}
    </div>
  );
}

/** Single icon button that flips between light and dark. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, setPreference } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setPreference(resolved === 'dark' ? 'light' : 'dark')}
      aria-label={resolved === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className={cn(
        'grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="size-[18px] dark:hidden" aria-hidden />
    </button>
  );
}
