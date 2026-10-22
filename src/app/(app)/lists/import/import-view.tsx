'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardPaste, FileSpreadsheet, Lock, Sparkles, Trash2, Upload } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Segmented } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { dedupe, parsePairs, type ImportRow as Row } from '@/lib/import-parse';


type Tab = 'paste' | 'file' | 'ai';

const HEADER_WORD = ['word', 'kelime', 'english', 'ingilizce', 'en'];
const HEADER_TR = ['translation', 'çeviri', 'ceviri', 'anlam', 'meaning', 'türkçe', 'turkce', 'tr'];
const HEADER_EX = ['example', 'örnek', 'ornek', 'sentence', 'cümle'];

async function parseFile(file: File): Promise<Row[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt') return parsePairs(await file.text());

  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false }) as unknown[][];
  if (grid.length === 0) return [];

  const header = (grid[0] ?? []).map((c) => String(c ?? '').trim().toLocaleLowerCase('tr-TR'));
  const find = (names: string[]) => header.findIndex((h) => names.includes(h));
  let wi = find(HEADER_WORD);
  let ti = find(HEADER_TR);
  const ei = find(HEADER_EX);
  const hasHeader = wi !== -1 || ti !== -1;
  if (wi === -1) wi = 0;
  if (ti === -1) ti = wi === 0 ? 1 : 0;

  return dedupe(
    grid.slice(hasHeader ? 1 : 0).map((r) => ({
      word: String(r[wi] ?? '').trim(),
      turkishTranslation: String(r[ti] ?? '').trim(),
      exampleSentence: ei >= 0 ? String(r[ei] ?? '').trim() : '',
      include: true,
    })),
  );
}

export function ImportView({
  lists,
  initialListId,
  fileImport,
  ai,
}: {
  lists: Array<{ id: string; name: string }>;
  initialListId: string | null;
  fileImport: boolean;
  ai: { available: boolean; remaining: number | null };
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('paste');
  const [text, setText] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [target, setTarget] = useState<'new' | string>(initialListId ?? 'new');
  const [listName, setListName] = useState('');
  const [saving, setSaving] = useState(false);

  const included = rows.filter((r) => r.include);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const parsed = await parseFile(file);
        setFileName(file.name);
        setRows(parsed);
        if (!listName) setListName(file.name.replace(/\.[^.]+$/, ''));
        if (parsed.length === 0) toast.error('Dosyada kelime bulunamadı', 'İlk sütunda İngilizce, ikinci sütunda Türkçe olmalı.');
      } catch {
        toast.error('Dosya okunamadı', 'Excel (.xlsx), CSV ya da TXT dosyası yükle.');
      }
    },
    [listName, toast],
  );

  async function extract() {
    setExtracting(true);
    try {
      const res = await api<{ words: Array<{ word: string; turkishTranslation: string; exampleSentence?: string }> }>('/api/ai/extract', {
        method: 'POST',
        body: { text },
      });
      setRows(dedupe(res.words.map((w) => ({ ...w, exampleSentence: w.exampleSentence ?? '', include: true }))));
    } catch (error) {
      toast.error('Kelimeler çıkarılamadı', errorMessage(error));
    } finally {
      setExtracting(false);
    }
  }

  async function save() {
    if (included.length === 0) return;
    if (target === 'new' && !listName.trim()) {
      toast.error('Listeye bir ad ver');
      return;
    }
    setSaving(true);
    const words = included.map(({ word, turkishTranslation, exampleSentence }) => ({ word, turkishTranslation, exampleSentence }));
    try {
      let id = target;
      let added: number;
      if (target === 'new') {
        const res = await api<{ id: string; added: number }>('/api/lists', { method: 'POST', body: { name: listName, words } });
        id = res.id;
        added = res.added;
      } else {
        const res = await api<{ added: number; skipped: number }>(`/api/lists/${target}/words`, { method: 'POST', body: { words } });
        added = res.added;
      }
      toast.success(`${added} kelime eklendi`);
      router.push(`/lists/${id}`);
      router.refresh();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
      setSaving(false);
    }
  }

  const switchTab = (t: Tab) => {
    setTab(t);
    setRows([]);
    setFileName('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/lists" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Listelerim
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">Kelimeleri içe aktar</h1>
        <p className="mt-1 text-sm text-muted">Elindeki kelime listesini saniyeler içinde VocabMaster’a taşı.</p>
      </div>

      <Segmented
        label="İçe aktarma yöntemi"
        value={tab}
        onChange={switchTab}
        options={[
          { value: 'paste', label: <span className="flex items-center gap-1.5"><ClipboardPaste className="size-4" /> Yapıştır</span> },
          { value: 'file', label: <span className="flex items-center gap-1.5"><FileSpreadsheet className="size-4" /> Dosya</span> },
          { value: 'ai', label: <span className="flex items-center gap-1.5"><Sparkles className="size-4" /> Metinden (AI)</span> },
        ]}
      />

      <Card>
        <CardBody>
          {tab === 'paste' && (
            <div className="space-y-3">
              <Field label="Her satıra bir kelime" hint="Biçim: kelime - anlam (ayraç olarak - : ; , ya da sekme kullanabilirsin).">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={8}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setRows(parsePairs(e.target.value));
                    }}
                    placeholder={'resilient - dayanıklı\nabandon - terk etmek\nthorough: titiz, eksiksiz'}
                    className="font-mono text-sm"
                  />
                )}
              </Field>
            </div>
          )}

          {tab === 'file' &&
            (fileImport ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                  dragging ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary',
                )}
              >
                <Upload className="size-8 text-primary" />
                <span className="mt-3 font-semibold">{fileName || 'Dosyayı sürükle ya da seç'}</span>
                <span className="mt-1 text-sm text-muted">Excel (.xlsx, .xls), CSV ya da TXT · ilk sütun İngilizce, ikinci sütun Türkçe</span>
                <input type="file" accept=".xlsx,.xls,.csv,.txt" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            ) : (
              <div className="flex flex-col items-center rounded-2xl bg-violet-soft px-6 py-10 text-center">
                <Lock className="size-7 text-violet" />
                <p className="mt-3 font-display text-lg font-bold">Dosyadan içe aktarma Pro’ya özel</p>
                <p className="mt-1 max-w-md text-sm text-muted">
                  Ücretsiz planda kelimelerini <button type="button" className="font-semibold text-primary underline" onClick={() => switchTab('paste')}>yapıştırarak</button> aynı şekilde aktarabilirsin.
                </p>
                <ButtonLink href="/pricing" size="sm" className="mt-5">
                  Pro’yu incele
                </ButtonLink>
              </div>
            ))}

          {tab === 'ai' && (
            <div className="space-y-3">
              <Field
                label="Metni yapıştır"
                hint="Bir makale paragrafı, ders notu ya da dağınık bir kelime listesi olabilir. Yapay zekâ kelimeleri ve anlamlarını ayıklar (1 AI hakkı)."
              >
                {(p) => (
                  <Textarea
                    {...p}
                    rows={8}
                    maxLength={4000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ör. bir İngilizce haber metni…"
                  />
                )}
              </Field>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-subtle">{text.length}/4000</span>
                <Button onClick={extract} loading={extracting} disabled={!ai.available || ai.remaining === 0 || text.trim().length < 3}>
                  <Sparkles /> Kelimeleri çıkar
                </Button>
              </div>
              {!ai.available && <p className="text-sm text-warning">Yapay zekâ şu an kullanılamıyor.</p>}
              {ai.available && ai.remaining === 0 && <p className="text-sm text-warning">Bugünkü AI hakkın doldu. Yarın yenilenir.</p>}
            </div>
          )}
        </CardBody>
      </Card>

      {rows.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader
            title={`Önizleme (${included.length}/${rows.length})`}
            description="Eklemek istemediklerinin işaretini kaldır."
            action={
              <Button variant="ghost" size="sm" onClick={() => setRows((r) => r.map((x) => ({ ...x, include: !r.every((y) => y.include) })))}>
                {rows.every((r) => r.include) ? 'Hiçbirini seçme' : 'Hepsini seç'}
              </Button>
            }
          />
          <ul className="mt-3 max-h-96 divide-y divide-border overflow-y-auto border-y border-border">
            {rows.map((r, i) => (
              <li key={`${r.word}-${i}`} className={cn('flex items-center gap-3 px-5 py-2.5', !r.include && 'opacity-50')}>
                <input
                  type="checkbox"
                  checked={r.include}
                  onChange={() => setRows((all) => all.map((x, j) => (j === i ? { ...x, include: !x.include } : x)))}
                  className="size-4 accent-[var(--primary)]"
                  aria-label={`${r.word} ekle`}
                />
                <span className="min-w-0 flex-1 truncate font-semibold">{r.word}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{r.turkishTranslation}</span>
                <button
                  type="button"
                  onClick={() => setRows((all) => all.filter((_, j) => j !== i))}
                  className="text-subtle hover:text-danger"
                  aria-label={`${r.word} kaldır`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nereye eklensin?">
                {(p) => (
                  <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                    <option value="new">Yeni liste oluştur</option>
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              {target === 'new' && (
                <Field label="Yeni listenin adı">
                  {(p) => <Input {...p} value={listName} maxLength={80} onChange={(e) => setListName(e.target.value)} placeholder="Ör. Ünite 3 kelimeleri" />}
                </Field>
              )}
            </div>
            <div className="flex justify-end">
              <Button size="lg" onClick={save} loading={saving} disabled={included.length === 0}>
                {included.length} kelimeyi ekle
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
