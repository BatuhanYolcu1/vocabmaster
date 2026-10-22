'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { Avatar, PageHeader, Segmented, Skeleton } from '@/components/ui/misc';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { useApiData } from '@/lib/use-api-data';
import { relativeDayLabel } from '@/lib/dates';
import { formatNumber } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  subscriptionType: 'FREE' | 'LITE' | 'PRO';
  subscriptionEndsAt: string | null;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  createdAt: string;
  _count: { wordLists: number; progress: number };
}

const DURATIONS = [
  { value: '30', label: '30 gün' },
  { value: '90', label: '3 ay' },
  { value: '365', label: '1 yıl' },
  { value: '0', label: 'Süresiz' },
];

export default function AdminUsersPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [plan, setPlan] = useState<'all' | 'FREE' | 'PRO'>('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ plan: 'FREE' as 'FREE' | 'PRO', days: '30', role: 'USER' as 'USER' | 'ADMIN' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page) });
  if (debounced) params.set('q', debounced);
  if (plan !== 'all') params.set('plan', plan);
  const { data, reload: load } = useApiData<{ users: AdminUser[]; total: number; pageCount: number }>(`/api/admin/users?${params}`);

  function open(u: AdminUser) {
    setEditing(u);
    setForm({ plan: u.subscriptionType === 'FREE' ? 'FREE' : 'PRO', days: '30', role: u.role });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await api('/api/admin/users', {
        method: 'PATCH',
        body: { userId: editing.id, plan: form.plan, days: Number(form.days), role: form.role },
      });
      toast.success('Kullanıcı güncellendi');
      setEditing(null);
      load();
    } catch (error) {
      toast.error('Güncellenemedi', errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Kullanıcılar" description={data ? `${formatNumber(data.total)} kullanıcı` : ' '} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ad ya da e-posta ara" className="pl-10" aria-label="Kullanıcı ara" />
        </div>
        <Segmented
          label="Plan filtresi"
          value={plan}
          onChange={(v) => {
            setPlan(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'Tümü' },
            { value: 'FREE', label: 'Ücretsiz' },
            { value: 'PRO', label: 'Pro' },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Kullanıcı</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 text-right font-semibold">XP</th>
                <th className="px-4 py-3 text-right font-semibold">Kelime</th>
                <th className="px-4 py-3 font-semibold">Son çalışma</th>
                <th className="px-4 py-3 font-semibold">Kayıt</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!data
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <Skeleton className="h-8" />
                      </td>
                    </tr>
                  ))
                : data.users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-2/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size={32} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-semibold">
                              {u.name ?? '—'} {u.role === 'ADMIN' && <Shield className="size-3.5 text-warning" aria-label="Admin" />}
                            </p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.subscriptionType === 'FREE' ? (
                          <Badge>Ücretsiz</Badge>
                        ) : (
                          <Badge tone="violet">
                            <Sparkles /> Pro{u.subscriptionEndsAt ? ` · ${new Date(u.subscriptionEndsAt).toLocaleDateString('tr-TR')}` : ''}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular">{formatNumber(u.xp)}</td>
                      <td className="px-4 py-3 text-right tabular">{formatNumber(u._count.progress)}</td>
                      <td className="px-4 py-3 text-muted">{u.lastStudyDate ? relativeDayLabel(new Date(u.lastStudyDate)) : '—'}</td>
                      <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => open(u)}>
                          Düzenle
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
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
        title={editing?.name ?? editing?.email ?? ''}
        description={editing?.email}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Vazgeç
            </Button>
            <Button onClick={save} loading={saving}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Plan">
            {(p) => (
              <Select {...p} value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as 'FREE' | 'PRO' }))}>
                <option value="FREE">Ücretsiz</option>
                <option value="PRO">Pro</option>
              </Select>
            )}
          </Field>
          {form.plan === 'PRO' && (
            <Field label="Süre" hint="Bugünden itibaren hesaplanır.">
              {(p) => (
                <Select {...p} value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))}>
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
          <Field label="Rol">
            {(p) => (
              <Select {...p} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'USER' | 'ADMIN' }))}>
                <option value="USER">Kullanıcı</option>
                <option value="ADMIN">Admin</option>
              </Select>
            )}
          </Field>
        </div>
      </Dialog>
    </>
  );
}
