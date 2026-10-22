'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileUp } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';

const SUGGESTIONS = ['YDS kelimeleri', 'Okuduğum kitap', 'Dizi & film', 'İş yazışmaları', 'IELTS'];

export function NewListForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Listeye bir ad ver.');
      return;
    }
    setSaving(true);
    try {
      const list = await api<{ id: string }>('/api/lists', { method: 'POST', body: { name, description } });
      toast.success('Liste oluşturuldu', 'Şimdi kelime ekleyebilirsin.');
      router.push(`/lists/${list.id}`);
    } catch (err) {
      toast.error('Liste oluşturulamadı', errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/lists" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Listelerim
      </Link>
      <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">Yeni liste</h1>
      <p className="mt-1 text-sm text-muted">Önce listeye bir ad ver; kelimeleri bir sonraki adımda ekleyeceğiz.</p>

      <Card className="mt-6">
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Liste adı" error={error}>
              {(p) => (
                <Input
                  {...p}
                  autoFocus
                  maxLength={80}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Örn. YDS kelimeleri"
                />
              )}
            </Field>
            <div className="-mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
            <Field label="Açıklama" optional>
              {(p) => (
                <Textarea
                  {...p}
                  rows={3}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu liste ne için? (ör. 'Harry Potter 1. kitaptaki bilmediğim kelimeler')"
                />
              )}
            </Field>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ButtonLink href="/lists" variant="ghost">
                Vazgeç
              </ButtonLink>
              <Button type="submit" loading={saving}>
                Oluştur ve kelime ekle
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Link
        href="/lists/import"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted transition hover:border-primary hover:text-fg"
      >
        <FileUp className="size-5 text-primary" />
        <span>
          <span className="font-semibold text-fg">Elinde hazır bir liste mi var?</span> Excel/CSV dosyasından ya da bir metinden içe aktar.
        </span>
      </Link>
    </div>
  );
}
