'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Check, Layers, Library, Lock, Sparkles, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STUDY_MODES, STUDY_MODE_INFO, SESSION_SIZES, DEFAULT_SESSION_SIZE, type StudyMode } from '@/lib/study-modes';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { Segmented } from '@/components/ui/misc';
import { MODE_ICONS, MODE_TONES } from '@/components/study/mode-icons';

interface Props {
  initialSource: string;
  dueNow: number;
  weakCount: number;
  lists: Array<{ id: string; name: string; count: number; due: number }>;
  categories: Array<{ name: string; label: string; count: number }>;
  storyEnabled: boolean;
}

type Kind = 'daily' | 'weak' | 'list' | 'category';

export function StudyHub({ initialSource, dueNow, weakCount, lists, categories, storyEnabled }: Props) {
  const router = useRouter();
  const initialKind: Kind = initialSource.startsWith('list:')
    ? 'list'
    : initialSource.startsWith('category:')
      ? 'category'
      : initialSource === 'weak' && weakCount > 0
        ? 'weak'
        : 'daily';

  const [kind, setKind] = useState<Kind>(initialKind);
  const [listId, setListId] = useState(initialSource.startsWith('list:') ? initialSource.slice(5) : lists[0]?.id ?? '');
  const [category, setCategory] = useState(
    initialSource.startsWith('category:') ? initialSource.slice(9) : categories[0]?.name ?? '',
  );
  const [mode, setMode] = useState<StudyMode>('flashcard');
  const [size, setSize] = useState<string>(String(DEFAULT_SESSION_SIZE));

  const source = useMemo(() => {
    if (kind === 'list') return `list:${listId}`;
    if (kind === 'category') return `category:${category}`;
    return kind;
  }, [kind, listId, category]);

  const selectedList = lists.find((l) => l.id === listId);
  const canStart = (kind !== 'list' || (selectedList && selectedList.count > 0)) && (kind !== 'category' || !!category);

  const sources: Array<{ kind: Kind; title: string; description: string; icon: typeof Zap; badge?: string; disabled?: boolean }> = [
    {
      kind: 'daily',
      title: 'Günlük çalışma',
      description: dueNow > 0 ? 'Tekrarı gelenler + sana uygun yeni kelimeler' : 'Seviyene ve ilgi alanlarına göre yeni kelimeler',
      icon: Zap,
      badge: dueNow > 0 ? `${dueNow} tekrar` : undefined,
    },
    {
      kind: 'weak',
      title: 'Zayıf kelimeler',
      description: weakCount > 0 ? 'En çok hata yaptığın kelimelere odaklan' : 'Hata yaptığın kelimeler burada toplanır',
      icon: Target,
      badge: weakCount > 0 ? String(weakCount) : undefined,
      disabled: weakCount === 0,
    },
    {
      kind: 'list',
      title: 'Listelerimden',
      description: lists.length ? 'Kendi oluşturduğun bir listeyi çalış' : 'Henüz listen yok',
      icon: Layers,
      disabled: lists.length === 0,
    },
    { kind: 'category', title: 'Kütüphaneden', description: 'Hazır bir konu seç: iş, seyahat, akademik…', icon: Library },
  ];

  function start() {
    router.push(`/study/${mode}?source=${encodeURIComponent(source)}&size=${size}`);
  }

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:pb-0">
      <section aria-labelledby="src-h">
        <h2 id="src-h" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          1 · Ne çalışalım?
        </h2>
        <div className="space-y-2.5">
          {sources.map((s) => {
            const active = kind === s.kind;
            const Icon = s.icon;
            return (
              <div key={s.kind}>
                <button
                  type="button"
                  disabled={s.disabled}
                  onClick={() => setKind(s.kind)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-3.5 rounded-2xl border-2 bg-surface p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    active ? 'border-primary' : 'border-border hover:border-border-strong',
                  )}
                >
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', active ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-muted')}>
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold text-fg">
                      {s.title}
                      {s.badge && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary-soft-fg">{s.badge}</span>}
                    </span>
                    <span className="block text-sm text-muted">{s.description}</span>
                  </span>
                  {active && <Check className="size-5 text-primary" />}
                </button>
                {active && s.kind === 'list' && lists.length > 0 && (
                  <div className="mt-2 animate-fade-in">
                    <Select value={listId} onChange={(e) => setListId(e.target.value)} aria-label="Liste seç">
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} — {l.count} kelime{l.due ? ` · ${l.due} tekrar` : ''}
                        </option>
                      ))}
                    </Select>
                    {selectedList && selectedList.count === 0 && (
                      <p className="mt-2 text-sm text-warning">
                        Bu liste boş.{' '}
                        <Link href={`/lists/${selectedList.id}`} className="font-semibold underline">
                          Kelime ekle
                        </Link>
                      </p>
                    )}
                  </div>
                )}
                {active && s.kind === 'category' && (
                  <div className="mt-2 flex animate-fade-in flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCategory(c.name)}
                        aria-pressed={category === c.name}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                          category === c.name ? 'border-primary bg-primary-soft text-primary-soft-fg' : 'border-border bg-surface text-muted hover:text-fg',
                        )}
                      >
                        {c.label} <span className="opacity-60">{c.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="mode-h">
        <h2 id="mode-h" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          2 · Nasıl çalışalım?
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {STUDY_MODES.map((m) => {
            const info = STUDY_MODE_INFO[m];
            const Icon = MODE_ICONS[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                onDoubleClick={() => {
                  setMode(m);
                  if (canStart) router.push(`/study/${m}?source=${encodeURIComponent(source)}&size=${size}`);
                }}
                aria-pressed={active}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border-2 bg-surface p-4 text-left transition-colors',
                  active ? 'border-primary' : 'border-border hover:border-border-strong',
                )}
              >
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', MODE_TONES[m])}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{info.name}</span>
                  <span className="block text-sm text-muted">{info.description}</span>
                </span>
              </button>
            );
          })}
          <Link
            href="/study/story"
            className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-border bg-surface p-4 text-left transition-colors hover:border-violet/50 sm:col-span-2"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet">
              <BookOpen className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold text-fg">
                Hikâye modu
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-soft px-2 py-0.5 text-[11px] font-bold text-violet">
                  {storyEnabled ? <Sparkles className="size-3" /> : <Lock className="size-3" />} PRO
                </span>
              </span>
              <span className="block text-sm text-muted">Öğrendiğin kelimelerle yapay zekânın yazdığı kısa hikâyeleri oku.</span>
            </span>
            <ArrowRight className="mt-2.5 size-4 text-subtle" />
          </Link>
        </div>

        <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 border-t border-border bg-surface/95 p-4 backdrop-blur lg:static lg:mt-6 lg:rounded-2xl lg:border lg:shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="hidden sm:block">
              <Segmented
                label="Oturum uzunluğu"
                value={size}
                onChange={setSize}
                options={SESSION_SIZES.map((n) => ({ value: String(n), label: `${n}` }))}
              />
              <p className="mt-1 text-center text-[11px] text-subtle">kelime</p>
            </div>
            <Button size="lg" className="flex-1" onClick={start} disabled={!canStart}>
              {STUDY_MODE_INFO[mode].name} ile başla <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
