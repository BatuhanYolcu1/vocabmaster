import type { Metadata } from 'next';
import Link from 'next/link';
import { FileUp, Layers, Plus } from 'lucide-react';
import { requireOnboardedUser } from '@/server/session';
import { getListSummaries } from '@/server/lists';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, PageHeader } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { relativeDayLabel } from '@/lib/dates';

export const metadata: Metadata = { title: 'Listelerim' };

export default async function ListsPage() {
  const user = await requireOnboardedUser();
  const lists = await getListSummaries(user.id);

  return (
    <>
      <PageHeader
        title="Listelerim"
        description="Kendi kelime koleksiyonların. Okuduğun bir kitap, bir dizi ya da sınav için liste oluştur."
        actions={
          <>
            <ButtonLink href="/lists/import" variant="secondary">
              <FileUp /> İçe aktar
            </ButtonLink>
            <ButtonLink href="/lists/new">
              <Plus /> Yeni liste
            </ButtonLink>
          </>
        }
      />

      {lists.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="Henüz bir listen yok"
            description="İlk listeni oluştur, kelimeleri elle ya da yapay zekâ yardımıyla ekle. İstersen kütüphaneden hazır kelimeler de ekleyebilirsin."
            action={
              <>
                <ButtonLink href="/lists/new">
                  <Plus /> Liste oluştur
                </ButtonLink>
                <ButtonLink href="/library" variant="secondary">
                  Kütüphaneye göz at
                </ButtonLink>
              </>
            }
            className="py-16"
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lists.map((l) => (
            <Link
              key={l.id}
              href={`/lists/${l.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg">
                  <Layers className="size-5" />
                </span>
                {l.due > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-fg">{l.due} tekrar</span>
                )}
              </div>
              <h2 className="mt-4 truncate font-display text-lg font-bold text-fg group-hover:text-primary">{l.name}</h2>
              <p className="mt-0.5 line-clamp-2 min-h-10 text-sm text-muted">{l.description || `${l.count} kelime`}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted">
                  <span>
                    <span className="font-semibold tabular text-fg">{l.learned}</span>/{l.count} öğrenildi
                  </span>
                  <span>{relativeDayLabel(new Date(l.updatedAt))}</span>
                </div>
                <ProgressBar value={l.learned} max={Math.max(l.count, 1)} tone="success" label={`${l.name} ilerleme`} />
              </div>
            </Link>
          ))}
          <Link
            href="/lists/new"
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted transition hover:border-primary hover:text-primary"
          >
            <Plus className="size-6" />
            <span className="text-sm font-semibold">Yeni liste</span>
          </Link>
        </div>
      )}
    </>
  );
}
