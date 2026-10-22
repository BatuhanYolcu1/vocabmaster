'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Chip, PageHeader, Skeleton } from '@/components/ui/misc';
import { LevelBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { useApiData } from '@/lib/use-api-data';
import { CATEGORIES, CEFR_LEVELS, WORD_TYPES, WORD_TYPE_LABELS, CATEGORY_INFO } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

interface AdminWord {
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
}

type Draft = Omit<AdminWord, 'id' | 'pronunciation'> & { pronunciation: string };

const empty: Draft = {
  word: '',
  turkishTranslation: '',
  definitionTr: '',
  exampleSentence: '',
  exampleSentenceTr: '',
  type: 'noun',
  level: 'B1',
  category: 'Genel',
  pronunciation: '',
};

export default function AdminWordsPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [incomplete, setIncomplete] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<AdminWord | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page) });
  if (debounced) params.set('q', debounced);
  if (category) params.set('category', category);
  if (incomplete) params.set('incomplete', '1');
  const { data, reload: load } = useApiData<{ words: AdminWord[]; total: number; pageCount: number }>(`/api/admin/words?${params}`);

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditing((ed) => (ed ? { ...ed, draft: { ...ed.draft, [key]: e.target.value } } : ed));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      if (editing.id) await api('/api/admin/words', { method: 'PATCH', body: { id: editing.id, ...editing.draft } });
      else await api('/api/admin/words', { method: 'POST', body: editing.draft });
      toast.success(editing.id ? 'Kelime güncellendi' : 'Kelime eklendi');
      setEditing(null);
      load();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api('/api/admin/words', { method: 'DELETE', body: { id: deleting.id } });
      toast.success('Kelime silindi');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error('Silinemedi', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Kütüphane kelimeleri"
        description={data ? `${formatNumber(data.total)} kelime` : ' '}
        actions={
          <Button onClick={() => setEditing({ id: null, draft: empty })}>
            <Plus /> Kelime ekle
          </Button>
        }
      />
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kelime ya da anlam ara" className="pl-10" aria-label="Kelime ara" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => { setCategory(''); setPage(1); }}>Tümü</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => { setCategory(c); setPage(1); }}>
              {CATEGORY_INFO[c]?.label ?? c}
            </Chip>
          ))}
          <Chip active={incomplete} onClick={() => { setIncomplete((v) => !v); setPage(1); }} className="ml-auto">
            Eksik içerikli
          </Chip>
        </div>
      </div>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {!data
            ? Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="px-4 py-3">
                  <Skeleton className="h-9" />
                </li>
              ))
            : data.words.map((w) => (
                <li key={w.id} className="flex items-center gap-3 px-4 py-3">
                  <LevelBadge level={w.level} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {w.word} <span className="text-xs font-normal text-subtle">{WORD_TYPE_LABELS[w.type] ?? w.type}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{w.turkishTranslation}</p>
                  </div>
                  <span className="hidden text-xs text-muted sm:inline">{CATEGORY_INFO[w.category]?.label ?? w.category}</span>
                  {(!w.exampleSentence || !w.definitionTr) && <span className="text-xs font-medium text-warning">eksik</span>}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${w.word} düzenle`}
                    onClick={() =>
                      setEditing({
                        id: w.id,
                        draft: { ...w, pronunciation: w.pronunciation ?? '' },
                      })
                    }
                  >
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`${w.word} sil`} onClick={() => setDeleting(w)}>
                    <Trash2 />
                  </Button>
                </li>
              ))}
        </ul>
        {data && data.pageCount > 1 && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3">
            <Button variant="secondary" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Önceki">
              <ChevronLeft />
            </Button>
            <span className="text-sm tabular text-muted">
              {page}/{data.pageCount}
            </span>
            <Button variant="secondary" size="icon-sm" disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} aria-label="Sonraki">
              <ChevronRight />
            </Button>
          </div>
        )}
      </Card>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Kelimeyi düzenle' : 'Yeni kütüphane kelimesi'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Vazgeç
            </Button>
            <Button type="submit" form="admin-word" loading={busy}>
              Kaydet
            </Button>
          </>
        }
      >
        {editing && (
          <form id="admin-word" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="İngilizce">{(p) => <Input {...p} required value={editing.draft.word} onChange={set('word')} />}</Field>
            <Field label="Türkçe anlamı">{(p) => <Input {...p} required value={editing.draft.turkishTranslation} onChange={set('turkishTranslation')} />}</Field>
            <Field label="Tanım" className="sm:col-span-2">{(p) => <Input {...p} value={editing.draft.definitionTr} onChange={set('definitionTr')} />}</Field>
            <Field label="Örnek cümle">{(p) => <Textarea {...p} rows={2} value={editing.draft.exampleSentence} onChange={set('exampleSentence')} className="min-h-0" />}</Field>
            <Field label="Cümle çevirisi">{(p) => <Textarea {...p} rows={2} value={editing.draft.exampleSentenceTr} onChange={set('exampleSentenceTr')} className="min-h-0" />}</Field>
            <Field label="Tür">
              {(p) => (
                <Select {...p} value={editing.draft.type} onChange={set('type')}>
                  {WORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {WORD_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Telaffuz (IPA)">{(p) => <Input {...p} value={editing.draft.pronunciation} onChange={set('pronunciation')} className="font-mono" />}</Field>
            <Field label="Seviye">
              {(p) => (
                <Select {...p} value={editing.draft.level} onChange={set('level')}>
                  {CEFR_LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Kategori">
              {(p) => (
                <Select {...p} value={editing.draft.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_INFO[c]?.label ?? c}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title={`“${deleting?.word}” silinsin mi?`}
        description="Kelime kütüphaneden, kullanıcıların listelerinden ve ilerlemelerinden kalıcı olarak kaldırılır."
        confirmLabel="Sil"
      />
    </>
  );
}
