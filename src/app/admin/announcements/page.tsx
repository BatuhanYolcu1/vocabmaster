'use client';

import { useState } from 'react';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/field';
import { EmptyState, PageHeader } from '@/components/ui/misc';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { useApiData } from '@/lib/use-api-data';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  active: boolean;
  targetPlan: 'FREE' | 'PRO' | null;
  expiresAt: string | null;
  createdAt: string;
}

const TYPES: Record<Announcement['type'], { label: string; tone: BadgeTone }> = {
  info: { label: 'Bilgi', tone: 'primary' },
  success: { label: 'Müjde', tone: 'success' },
  warning: { label: 'Uyarı', tone: 'warning' },
  promo: { label: 'Kampanya', tone: 'violet' },
};

const empty = { title: '', message: '', type: 'info' as Announcement['type'], targetPlan: '' as '' | 'FREE' | 'PRO', expiresAt: '' };

export default function AdminAnnouncementsPage() {
  const toast = useToast();
  const [editing, setEditing] = useState<{ id: string | null; draft: typeof empty } | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: items, reload: load } = useApiData<Announcement[]>('/api/admin/announcements');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const body = {
      title: editing.draft.title,
      message: editing.draft.message,
      type: editing.draft.type,
      targetPlan: editing.draft.targetPlan || null,
      expiresAt: editing.draft.expiresAt ? new Date(`${editing.draft.expiresAt}T23:59:59`).toISOString() : null,
    };
    try {
      if (editing.id) await api('/api/admin/announcements', { method: 'PATCH', body: { id: editing.id, ...body } });
      else await api('/api/admin/announcements', { method: 'POST', body });
      toast.success('Duyuru kaydedildi');
      setEditing(null);
      load();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(a: Announcement) {
    try {
      await api('/api/admin/announcements', { method: 'PATCH', body: { id: a.id, active: !a.active } });
      load();
    } catch (error) {
      toast.error('Güncellenemedi', errorMessage(error));
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api('/api/admin/announcements', { method: 'DELETE', body: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (error) {
      toast.error('Silinemedi', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const setField = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditing((ed) => (ed ? { ...ed, draft: { ...ed.draft, [key]: e.target.value } } : ed));

  return (
    <>
      <PageHeader
        title="Duyurular"
        description="Aktif duyurular uygulamanın üst kısmında görünür; kullanıcılar kapatabilir."
        actions={
          <Button onClick={() => setEditing({ id: null, draft: empty })}>
            <Plus /> Yeni duyuru
          </Button>
        }
      />
      <Card>
        {items && items.length === 0 ? (
          <EmptyState icon={Megaphone} title="Henüz duyuru yok" description="Yeni özellikleri, bakım saatlerini ya da kampanyaları buradan duyurabilirsin." />
        ) : (
          <ul className="divide-y divide-border">
            {(items ?? []).map((a) => (
              <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TYPES[a.type]?.tone ?? 'neutral'}>{TYPES[a.type]?.label ?? a.type}</Badge>
                    {a.targetPlan && <Badge>{a.targetPlan === 'PRO' ? 'Sadece Pro' : 'Sadece ücretsiz'}</Badge>}
                    {a.expiresAt && <span className="text-xs text-muted">bitiş: {new Date(a.expiresAt).toLocaleDateString('tr-TR')}</span>}
                  </div>
                  <p className="mt-1.5 font-semibold">{a.title}</p>
                  <p className="text-sm text-muted">{a.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch checked={a.active} onChange={() => toggle(a)} label={a.active ? 'Yayından kaldır' : 'Yayınla'} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Düzenle"
                    onClick={() =>
                      setEditing({
                        id: a.id,
                        draft: { title: a.title, message: a.message, type: a.type, targetPlan: a.targetPlan ?? '', expiresAt: a.expiresAt?.slice(0, 10) ?? '' },
                      })
                    }
                  >
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Sil" onClick={() => setDeleting(a)}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Duyuruyu düzenle' : 'Yeni duyuru'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Vazgeç
            </Button>
            <Button type="submit" form="ann-form" loading={busy}>
              Kaydet
            </Button>
          </>
        }
      >
        {editing && (
          <form id="ann-form" onSubmit={save} className="space-y-4">
            <Field label="Başlık">{(p) => <Input {...p} required maxLength={120} value={editing.draft.title} onChange={setField('title')} />}</Field>
            <Field label="Mesaj">{(p) => <Textarea {...p} required maxLength={500} rows={3} value={editing.draft.message} onChange={setField('message')} />}</Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Tür">
                {(p) => (
                  <Select {...p} value={editing.draft.type} onChange={setField('type')}>
                    {Object.entries(TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Kime">
                {(p) => (
                  <Select {...p} value={editing.draft.targetPlan} onChange={setField('targetPlan')}>
                    <option value="">Herkese</option>
                    <option value="FREE">Ücretsiz kullanıcılara</option>
                    <option value="PRO">Pro üyelere</option>
                  </Select>
                )}
              </Field>
              <Field label="Bitiş" optional>
                {(p) => <Input {...p} type="date" value={editing.draft.expiresAt} onChange={setField('expiresAt')} />}
              </Field>
            </div>
          </form>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title="Duyuru silinsin mi?" confirmLabel="Sil" />
    </>
  );
}
