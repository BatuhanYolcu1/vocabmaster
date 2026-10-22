'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, ListPlus, Play, Search, SearchX, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { Chip, EmptyState, Skeleton } from '@/components/ui/misc';
import { LevelBadge, StageBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Example, ListenButton } from '@/components/study/parts';
import { api, errorMessage } from '@/lib/fetcher';
import { useApiData } from '@/lib/use-api-data';
import { wordTypeLabel } from '@/lib/constants';
import type { CardStage } from '@/lib/srs';
import { cn } from '@/lib/utils';

interface LibraryWord {
  id: string;
  word: string;
  turkishTranslation: string;
  definitionTr: string;
  exampleSentence: string;
  exampleSentenceTr: string;
  type: string;
  level: string;
  category: string;
  pronunciation: string | null;
  stage: CardStage;
}

interface LibraryResponse {
  total: number;
  page: number;
  pageCount: number;
  words: LibraryWord[];
}

export function LibraryView({
  categories,
  levels,
  lists,
  targetListId,
  initialCategory,
}: {
  categories: Array<{ name: string; label: string; description: string; count: number }>;
  levels: string[];
  lists: Array<{ id: string; name: string }>;
  targetListId: string | null;
  initialCategory: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [detail, setDetail] = useState<LibraryWord | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [target, setTarget] = useState<string>(targetListId ?? lists[0]?.id ?? 'new');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page) });
  if (debounced) params.set('q', debounced);
  if (category) params.set('category', category);
  if (level) params.set('level', level);
  const { data, loading, error } = useApiData<LibraryResponse>(`/api/library?${params}`);

  const pickCategory = (c: string) => {
    setCategory(c);
    setPage(1);
  };
  const pickLevel = (l: string) => {
    setLevel(l);
    setPage(1);
  };

  const toggle = (w: LibraryWord) =>
    setSelected((s) => {
      const next = new Map(s);
      if (next.has(w.id)) next.delete(w.id);
      else next.set(w.id, w.word);
      return next;
    });

  async function addSelected() {
    setAdding(true);
    const wordIds = [...selected.keys()];
    try {
      let listId = target;
      let added: number;
      if (target === 'new') {
        if (!newName.trim()) {
          toast.error('Yeni listeye bir ad ver');
          setAdding(false);
          return;
        }
        const res = await api<{ id: string; added: number }>('/api/lists', { method: 'POST', body: { name: newName, wordIds } });
        listId = res.id;
        added = res.added;
      } else {
        const res = await api<{ added: number; skipped: number }>(`/api/lists/${target}/words`, { method: 'POST', body: { wordIds } });
        added = res.added;
      }
      toast.success(`${added} kelime listeye eklendi`);
      setSelected(new Map());
      setAddOpen(false);
      if (targetListId) router.push(`/lists/${listId}`);
      router.refresh();
    } catch (error) {
      toast.error('Eklenemedi', errorMessage(error));
    } finally {
      setAdding(false);
    }
  }

  const activeCategory = categories.find((c) => c.name === category);
  const targetList = lists.find((l) => l.id === targetListId);

  return (
    <div className="pb-24">
      {targetList && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-soft-fg">
          <span>
            Seçtiğin kelimeler <strong>{targetList.name}</strong> listesine eklenecek.
          </span>
          <Link href={`/lists/${targetList.id}`} className="font-semibold underline">
            Listeye dön
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İngilizce ya da Türkçe ara…" className="pl-10" aria-label="Kütüphanede ara" />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-fg" aria-label="Aramayı temizle">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={!category} onClick={() => pickCategory('')}>
            Tüm konular
          </Chip>
          {categories.map((c) => (
            <Chip key={c.name} active={category === c.name} onClick={() => pickCategory(category === c.name ? '' : c.name)}>
              {c.label} <span className="opacity-60">{c.count}</span>
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted">Seviye:</span>
          <Chip active={!level} onClick={() => pickLevel('')} className="h-7 px-2.5 text-xs">
            Hepsi
          </Chip>
          {levels.map((l) => (
            <Chip key={l} active={level === l} onClick={() => pickLevel(level === l ? '' : l)} className="h-7 px-2.5 font-mono text-xs">
              {l}
            </Chip>
          ))}
        </div>
      </div>

      {activeCategory && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-semibold">{activeCategory.label}</p>
            <p className="text-sm text-muted">{activeCategory.description}</p>
          </div>
          <ButtonLink href={`/study/flashcard?source=${encodeURIComponent(`category:${activeCategory.name}`)}`} size="sm">
            <Play className="fill-current" /> Bu konuyu çalış
          </ButtonLink>
        </div>
      )}

      <div className="mt-5">
        {loading && !data ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : error && !data ? (
          <Card>
            <EmptyState icon={SearchX} title="Kelimeler yüklenemedi" description={error} />
          </Card>
        ) : !data || data.words.length === 0 ? (
          <Card>
            <EmptyState icon={SearchX} title="Sonuç bulunamadı" description="Aramanı ya da filtreleri değiştirmeyi dene." />
          </Card>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-muted">
              <span>{data.total} kelime</span>
              {data.words.length > 0 && (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() =>
                    setSelected((s) => {
                      const next = new Map(s);
                      const all = data.words.every((w) => next.has(w.id));
                      data.words.forEach((w) => (all ? next.delete(w.id) : next.set(w.id, w.word)));
                      return next;
                    })
                  }
                >
                  {data.words.every((w) => selected.has(w.id)) ? 'Sayfadaki seçimi kaldır' : 'Sayfadakileri seç'}
                </button>
              )}
            </div>
            <div className={cn('grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3', loading && 'opacity-60')}>
              {data.words.map((w) => {
                const on = selected.has(w.id);
                return (
                  <div
                    key={w.id}
                    className={cn(
                      'group relative flex flex-col rounded-2xl border-2 bg-surface p-4 transition-colors',
                      on ? 'border-primary' : 'border-transparent shadow-sm ring-1 ring-border hover:ring-border-strong',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggle(w)}
                        aria-pressed={on}
                        aria-label={on ? `${w.word} seçimini kaldır` : `${w.word} seç`}
                        className={cn(
                          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
                          on ? 'border-primary bg-primary text-primary-fg' : 'border-border-strong',
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                      </button>
                      <button type="button" onClick={() => setDetail(w)} className="min-w-0 flex-1 text-left">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate font-display text-[17px] font-bold text-fg">{w.word}</span>
                          <span className="shrink-0 text-xs text-subtle">{wordTypeLabel(w.type)}</span>
                        </span>
                        <span className="block truncate text-sm text-muted">{w.turkishTranslation}</span>
                      </button>
                      <ListenButton text={w.word} className="size-8 [&_svg]:size-4" />
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 pl-8">
                      <LevelBadge level={w.level} />
                      {w.stage !== 'new' && <StageBadge stage={w.stage} />}
                    </div>
                  </div>
                );
              })}
            </div>
            {data.pageCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="secondary" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Önceki sayfa">
                  <ChevronLeft />
                </Button>
                <span className="text-sm tabular text-muted">
                  {page} / {data.pageCount}
                </span>
                <Button variant="secondary" size="icon" disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} aria-label="Sonraki sayfa">
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selected.size > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-20 px-4 pb-3 lg:bottom-0 lg:left-64">
          <div className="mx-auto flex max-w-xl animate-fade-in items-center gap-3 rounded-2xl border border-border bg-surface p-3 pl-5 shadow-lg">
            <span className="flex-1 whitespace-nowrap text-sm">
              <span className="font-bold tabular">{selected.size}</span> seçili
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Map())}>
              Temizle
            </Button>
            <Button size="sm" onClick={() => (targetListId ? addSelected() : setAddOpen(true))} loading={adding && !!targetListId}>
              <ListPlus /> Listeye ekle
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Listeye ekle"
        description={`${selected.size} kelime seçili`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={addSelected} loading={adding}>
              Ekle
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Liste">
            {(p) => (
              <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
                <option value="new">+ Yeni liste oluştur</option>
              </Select>
            )}
          </Field>
          {target === 'new' && (
            <Field label="Yeni listenin adı">
              {(p) => <Input {...p} value={newName} maxLength={80} onChange={(e) => setNewName(e.target.value)} placeholder="Ör. Seyahat hazırlığı" autoFocus />}
            </Field>
          )}
        </div>
      </Dialog>

      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.word ?? ''} description={detail?.pronunciation ?? undefined}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ListenButton text={detail.word} />
              <div className="flex flex-wrap items-center gap-1.5">
                <LevelBadge level={detail.level} />
                <span className="text-xs text-muted">{wordTypeLabel(detail.type)}</span>
                <StageBadge stage={detail.stage} />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-primary">{detail.turkishTranslation}</p>
              {detail.definitionTr && <p className="mt-1 text-muted">{detail.definitionTr}</p>}
            </div>
            {detail.exampleSentence && (
              <div className="rounded-xl bg-surface-2 p-4">
                <Example sentence={detail.exampleSentence} translation={detail.exampleSentenceTr} word={detail.word} />
              </div>
            )}
            <Button
              variant={selected.has(detail.id) ? 'secondary' : 'primary'}
              className="w-full"
              onClick={() => toggle(detail)}
            >
              {selected.has(detail.id) ? 'Seçimden çıkar' : 'Listeye eklemek için seç'}
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
