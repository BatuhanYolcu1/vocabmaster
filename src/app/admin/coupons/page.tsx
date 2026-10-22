'use client';

import { useState } from 'react';
import { Info, Plus, Ticket, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Switch } from '@/components/ui/field';
import { EmptyState, PageHeader } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { useApiData } from '@/lib/use-api-data';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

const empty = { code: '', discount: '20', maxUses: '100', expiresAt: '' };

export default function AdminCouponsPage() {
  const toast = useToast();
  const [creating, setCreating] = useState<typeof empty | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: items, reload: load } = useApiData<Coupon[]>('/api/admin/coupons');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!creating) return;
    setBusy(true);
    try {
      await api('/api/admin/coupons', {
        method: 'POST',
        body: {
          code: creating.code,
          discount: Number(creating.discount),
          maxUses: Number(creating.maxUses),
          expiresAt: creating.expiresAt ? new Date(`${creating.expiresAt}T23:59:59`).toISOString() : null,
        },
      });
      toast.success('Kupon oluşturuldu');
      setCreating(null);
      load();
    } catch (error) {
      toast.error('Oluşturulamadı', errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Coupon) {
    try {
      await api('/api/admin/coupons', { method: 'PATCH', body: { id: c.id, active: !c.active } });
      load();
    } catch (error) {
      toast.error('Güncellenemedi', errorMessage(error));
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api('/api/admin/coupons', { method: 'DELETE', body: { id: deleting.id } });
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
        title="Kuponlar"
        description="Pro üyelik için indirim kodları."
        actions={
          <Button onClick={() => setCreating(empty)}>
            <Plus /> Yeni kupon
          </Button>
        }
      />
      <div className="mb-4 flex gap-3 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Çevrim içi ödeme altyapısı henüz bağlı olmadığı için kuponlar şu an kullanıcı tarafında kullanılamıyor. Ödeme entegrasyonu
          tamamlandığında buradaki kodlar otomatik geçerli olur.
        </p>
      </div>
      <Card>
        {items && items.length === 0 ? (
          <EmptyState icon={Ticket} title="Henüz kupon yok" />
        ) : (
          <ul className="divide-y divide-border">
            {(items ?? []).map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-bold">{c.code}</p>
                  <p className="text-sm text-muted">
                    %{c.discount} indirim{c.expiresAt ? ` · ${new Date(c.expiresAt).toLocaleDateString('tr-TR')} tarihine kadar` : ''}
                  </p>
                </div>
                <div className="hidden w-40 sm:block">
                  <div className="mb-1 text-right text-xs tabular text-muted">
                    {c.usedCount}/{c.maxUses} kullanım
                  </div>
                  <ProgressBar value={c.usedCount} max={c.maxUses} className="h-1.5" label={`${c.code} kullanım`} />
                </div>
                <Switch checked={c.active} onChange={() => toggle(c)} label={c.active ? 'Pasifleştir' : 'Aktifleştir'} />
                <Button variant="ghost" size="icon-sm" aria-label="Sil" onClick={() => setDeleting(c)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={!!creating}
        onClose={() => setCreating(null)}
        title="Yeni kupon"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(null)}>
              Vazgeç
            </Button>
            <Button type="submit" form="coupon-form" loading={busy}>
              Oluştur
            </Button>
          </>
        }
      >
        {creating && (
          <form id="coupon-form" onSubmit={create} className="grid gap-4 sm:grid-cols-2">
            <Field label="Kod" hint="Harf, rakam, - ve _" className="sm:col-span-2">
              {(p) => (
                <Input
                  {...p}
                  required
                  value={creating.code}
                  onChange={(e) => setCreating((c) => c && { ...c, code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                  placeholder="YAZ2026"
                />
              )}
            </Field>
            <Field label="İndirim (%)">
              {(p) => <Input {...p} type="number" min={1} max={100} required value={creating.discount} onChange={(e) => setCreating((c) => c && { ...c, discount: e.target.value })} />}
            </Field>
            <Field label="En fazla kullanım">
              {(p) => <Input {...p} type="number" min={1} required value={creating.maxUses} onChange={(e) => setCreating((c) => c && { ...c, maxUses: e.target.value })} />}
            </Field>
            <Field label="Son geçerlilik" optional className="sm:col-span-2">
              {(p) => <Input {...p} type="date" value={creating.expiresAt} onChange={(e) => setCreating((c) => c && { ...c, expiresAt: e.target.value })} />}
            </Field>
          </form>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title={`${deleting?.code} silinsin mi?`} confirmLabel="Sil" />
    </>
  );
}
