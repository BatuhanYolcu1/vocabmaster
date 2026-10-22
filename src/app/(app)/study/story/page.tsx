import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lock } from 'lucide-react';
import { requireOnboardedUser } from '@/server/session';
import { getPlanInfo } from '@/server/plan';
import { getSettings } from '@/server/settings';
import { prisma } from '@/server/db';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/misc';
import { StoryView } from './story-view';
import { isCefrLevel } from '@/lib/constants';

export const metadata: Metadata = { title: 'Hikâye modu' };

export default async function StoryPage() {
  const user = await requireOnboardedUser();
  const [plan, settings, lists] = await Promise.all([
    getPlanInfo(user.id),
    getSettings(),
    prisma.wordList.findMany({
      where: { userId: user.id, items: { some: {} } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/study" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Çalış
      </Link>
      <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">Hikâye modu</h1>
      <p className="mt-1 text-sm text-muted sm:text-[15px]">
        Öğrendiğin kelimeler bir hikâyenin içinde karşına çıksın. Bağlam içinde görmek hatırlamayı kolaylaştırır.
      </p>

      <div className="mt-6">
        {!plan.limits.storyMode ? (
          <Card>
            <EmptyState
              icon={Lock}
              title="Hikâye modu Pro’ya özel"
              description="Pro ile yapay zekâ, çalıştığın kelimelerle sana özel kısa hikâyeler yazar; çevirisini ve sesli okunuşunu da görürsün."
              action={<ButtonLink href="/pricing">Pro’yu incele</ButtonLink>}
              className="py-14"
            />
          </Card>
        ) : !settings.AI_ENABLED || !process.env.GEMINI_API_KEY ? (
          <Card>
            <EmptyState icon={BookOpen} title="Yapay zekâ şu an kullanılamıyor" description="Biraz sonra tekrar dene." className="py-14" />
          </Card>
        ) : (
          <StoryView lists={lists} defaultLevel={isCefrLevel(user.languageLevel) ? user.languageLevel : 'B1'} />
        )}
      </div>
    </div>
  );
}
