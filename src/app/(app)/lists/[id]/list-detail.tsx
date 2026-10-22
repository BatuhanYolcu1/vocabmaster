'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Library, MoreHorizontal, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react';
import type { ListDetail, ListWord } from '@/server/lists';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/misc';
import { StageBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { WordForm, type WordDraft } from '@/components/word-form';
import { ListenButton } from '@/components/study/parts';
import { MODE_ICONS } from '@/components/study/mode-icons';
import { api, errorMessage } from '@/lib/fetcher';
import { STUDY_MODE_INFO, type StudyMode } from '@/lib/study-modes';
import { wordTypeLabel } from '@/lib/constants';
import { relativeDayLabel } from '@/lib/dates';

const QUICK_MODES: StudyMode[] = ['flashcard', 'multiple-choice', 'typing', 'matching'];

export function ListDetailView({ list, ai: initialAi }: { list: ListDetail; ai: { available: boolean; remaining: number | null } }) {
  const router = useRouter();
  const toast = useToast();
  const [ai, setAi] = useState(initialAi);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ListWord | null>(null);
  const [removing, setRemoving] = useState<ListWord | null>(null);
  const [busy, setBusy] = useState(false);
  const [editList, setEditList] = useState(false);
  const [deleteList, setDeleteList] = useState(false);
  const [menu, setMenu] = useState(false);
  const [meta, setMeta] = useState({ name: list.name, description: list.description ?? '' });

  const source = `list:${list.id}`;
  const learned = list.words.filter((w) => w.stage === 'review' || w.stage === 'mastered').length;
  const due = list.words.filter((w) => w.nextReview && new Date(w.nextReview) <= new Date()).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return list.words;
    return list.words.filter(
      (w) => w.word.toLocaleLowerCase('en-US').includes(q) || w.turkishTranslation.toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [list.words, query]);

  async function addWord(draft: WordDraft) {
    try {
      await api(`/api/lists/${list.id}/words`, { method: 'POST', body: { words: [draft] } });
      toast.success(`“${draft.word}” eklendi`);
      router.refresh();
      return true;
    } catch (error) {
      toast.error('Eklenemedi', errorMessage(error));
      return false;
    }
  }

  async function saveWord(draft: WordDraft) {
    if (!editing) return false;
    try {
      await api(`/api/lists/${list.id}/words/${editing.id}`, { method: 'PATCH', body: draft });
      toast.success('Kelime güncellendi');
      setEditing(null);
      router.refresh();
      return true;
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
      return false;
    }
  }

  async function removeWord() {
    if (!removing) return;
    setBusy(true);
    try {
      await api(`/api/lists/${list.id}/words/${removing.id}`, { method: 'DELETE' });
      toast.success(`“${removing.word}” listeden çıkarıldı`);
      setRemoving(null);
      router.refresh();
    } catch (error) {
      toast.error('Çıkarılamadı', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/lists/${list.id}`, { method: 'PATCH', body: meta });
      setEditList(false);
      router.refresh();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function removeList() {
    setBusy(true);
    try {
      await api(`/api/lists/${list.id}`, { method: 'DELETE' });
      toast.success('Liste silindi');
      router.push('/lists');
      router.refresh();
    } catch (error) {
      toast.error('Silinemedi', errorMessage(error));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lists" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Listelerim
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">{list.name}</h1>
            {list.description && <p className="mt-1 text-sm text-muted sm:text-[15px]">{list.description}</p>}
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold tabular text-fg">{list.words.length}</span> kelime ·{' '}
              <span className="font-semibold tabular text-fg">{learned}</span> öğrenildi
              {due > 0 && (
                <>
                  {' '}
                  · <span className="font-semibold text-primary">{due} tekrar bekliyor</span>
                </>
              )}
            </p>
          </div>
          <div className="relative">
            <Button variant="secondary" size="icon" onClick={() => setMenu((m) => !m)} aria-label="Liste seçenekleri" aria-expanded={menu}>
              <MoreHorizontal />
            </Button>
            {menu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
                <div role="menu" className="absolute right-0 z-40 mt-2 w-48 animate-fade-in rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setEditList(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-2"
                  >
                    <Pencil className="size-4 text-muted" /> Adı düzenle
                  </button>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setDeleteList(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger hover:bg-danger-soft"
                  >
                    <Trash2 className="size-4" /> Listeyi sil
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {list.words.length > 0 && (
        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-semibold">Bu listeyi çalış</p>
              <p className="text-sm text-muted">Önce tekrarı gelenler, sonra yeni kelimeler.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_MODES.map((m) => {
                const Icon = MODE_ICONS[m];
                if (m === 'matching' && list.words.length < 4) return null;
                return (
                  <ButtonLink key={m} href={`/study/${m}?source=${encodeURIComponent(source)}`} variant={m === 'flashcard' ? 'primary' : 'secondary'} size="sm">
                    {m === 'flashcard' ? <Play className="fill-current" /> : <Icon />} {STUDY_MODE_INFO[m].name}
                  </ButtonLink>
                );
              })}
              <ButtonLink href={`/study?source=${encodeURIComponent(source)}`} variant="ghost" size="sm">
                Diğer modlar
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Kelime ekle"
          description="İngilizce kelimeyi yaz, anlamını sen ekle ya da yapay zekâya doldurt."
          action={
            <ButtonLink href={`/library?list=${list.id}`} variant="ghost" size="sm">
              <Library /> Kütüphaneden
            </ButtonLink>
          }
        />
        <CardBody>
          <WordForm ai={ai} compact submitLabel="Listeye ekle" onSubmit={addWord} onAiUsed={(remaining) => setAi((a) => ({ ...a, remaining }))} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`Kelimeler (${list.words.length})`}
          action={
            list.words.length > 6 && (
              <div className="relative w-44 sm:w-60">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Listede ara" className="h-9 pl-9" aria-label="Listede ara" />
              </div>
            )
          }
        />
        {list.words.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Liste henüz boş"
            description="Yukarıdan ilk kelimeni ekle ya da kütüphaneden hazır kelimeler seç."
            className="py-10"
          />
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">“{query}” için sonuç yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {filtered.map((w) => (
              <li key={w.id} className="flex items-center gap-3 px-5 py-3.5">
                <ListenButton text={w.word} className="size-8 [&_svg]:size-4" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-fg">{w.word}</span>
                    <span className="text-xs text-subtle">{wordTypeLabel(w.type)}</span>
                  </p>
                  <p className="truncate text-sm text-muted">{w.turkishTranslation}</p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <StageBadge stage={w.stage} />
                  {w.nextReview && <span className="text-[11px] text-subtle">tekrar: {relativeDayLabel(new Date(w.nextReview))}</span>}
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {w.editable && (
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing(w)} aria-label={`${w.word} düzenle`}>
                      <Pencil />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setRemoving(w)} aria-label={`${w.word} listeden çıkar`}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!editing} onClose={() => setEditing(null)} title="Kelimeyi düzenle" size="lg">
        {editing && (
          <WordForm
            key={editing.id}
            ai={ai}
            submitLabel="Kaydet"
            initial={{
              word: editing.word,
              turkishTranslation: editing.turkishTranslation,
              definitionTr: editing.definitionTr,
              exampleSentence: editing.exampleSentence,
              exampleSentenceTr: editing.exampleSentenceTr,
              type: editing.type,
              pronunciation: editing.pronunciation ?? '',
            }}
            onSubmit={saveWord}
            onCancel={() => setEditing(null)}
            onAiUsed={(remaining) => setAi((a) => ({ ...a, remaining }))}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={removeWord}
        loading={busy}
        title="Kelime listeden çıkarılsın mı?"
        description={
          removing?.editable
            ? `“${removing.word}” bu listeden çıkarılacak ve başka bir listede yoksa ilerlemesiyle birlikte silinecek.`
            : `“${removing?.word}” bu listeden çıkarılacak. Kütüphane kelimesi olduğu için ilerlemen korunur.`
        }
        confirmLabel="Çıkar"
      />

      <Dialog
        open={editList}
        onClose={() => setEditList(false)}
        title="Listeyi düzenle"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditList(false)}>
              Vazgeç
            </Button>
            <Button type="submit" form="list-meta" loading={busy}>
              Kaydet
            </Button>
          </>
        }
      >
        <form id="list-meta" onSubmit={saveMeta} className="space-y-4">
          <Field label="Liste adı">
            {(p) => <Input {...p} value={meta.name} maxLength={80} onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))} required />}
          </Field>
          <Field label="Açıklama" optional>
            {(p) => <Textarea {...p} rows={3} value={meta.description} maxLength={300} onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))} />}
          </Field>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteList}
        onClose={() => setDeleteList(false)}
        onConfirm={removeList}
        loading={busy}
        title="Liste silinsin mi?"
        description="Liste ve sadece bu listede bulunan kendi eklediğin kelimeler kalıcı olarak silinir. Kütüphane kelimelerindeki ilerlemen korunur."
        confirmLabel="Listeyi sil"
      />
    </div>
  );
}
