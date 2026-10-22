'use client';

import { useSyncExternalStore } from 'react';
import { Info, Megaphone, PartyPopper, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

const STORAGE_KEY = 'vm-dismissed-announcements';
const styles: Record<string, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'bg-primary-soft text-primary-soft-fg' },
  success: { icon: PartyPopper, className: 'bg-success-soft text-success' },
  warning: { icon: TriangleAlert, className: 'bg-warning-soft text-warning' },
  promo: { icon: Megaphone, className: 'bg-violet-soft text-violet' },
};

const EVENT = 'vm-announcements';
let cachedRaw: string | null = null;
let cached: string[] = [];

function readDismissed(): string[] {
  let raw = '[]';
  try {
    raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = JSON.parse(raw);
    } catch {
      cached = [];
    }
  }
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function AnnouncementBar({ items }: { items: Announcement[] }) {
  // null on the server so nothing flashes before we know what was dismissed
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => null);

  if (!dismissed) return null;
  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id].slice(-50)));
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-2 px-4 pt-4 sm:px-6 lg:px-10">
      {visible.map((a) => {
        const s = styles[a.type] ?? styles.info;
        const Icon = s.icon;
        return (
          <div key={a.id} className={cn('flex items-start gap-3 rounded-xl px-4 py-3 text-sm', s.className)}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1">
              <span className="font-semibold">{a.title}</span> <span className="opacity-90">{a.message}</span>
            </p>
            <button type="button" onClick={() => dismiss(a.id)} aria-label="Duyuruyu kapat" className="opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
