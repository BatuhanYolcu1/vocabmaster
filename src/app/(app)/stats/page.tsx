import type { Metadata } from 'next';
import { BarChart3, BookCheck, CalendarDays, Crown, Flame, Target, Zap } from 'lucide-react';
import { requireOnboardedUser } from '@/server/session';
import { getDetailedStats } from '@/server/stats';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState, PageHeader, StatTile } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { BarChart, HBarList } from '@/components/charts/bar-chart';
import { CATEGORY_INFO } from '@/lib/constants';
import { STUDY_MODE_INFO, isStudyMode } from '@/lib/study-modes';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'İstatistikler' };

export default async function StatsPage() {
  const user = await requireOnboardedUser();
  const s = await getDetailedStats(user.id);

  if (s.totals.studied === 0) {
    return (
      <>
        <PageHeader title="İstatistikler" />
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Henüz gösterecek bir şey yok"
            description="İlk çalışmanı yaptığında ilerlemen, doğruluk oranın ve tekrar takvimin burada görünecek."
            action={<ButtonLink href="/study/flashcard?source=daily">İlk çalışmayı başlat</ButtonLink>}
            className="py-16"
          />
        </Card>
      </>
    );
  }

  const stageTotal = s.stages.learning + s.stages.review + s.stages.mastered;
  const stages = [
    { key: 'learning', label: 'Öğreniliyor', value: s.stages.learning, className: 'bg-warning', hint: '1 günden kısa aralıkla' },
    { key: 'review', label: 'Tekrarda', value: s.stages.review, className: 'bg-primary', hint: '1–20 gün aralıkla' },
    { key: 'mastered', label: 'Ustalaşıldı', value: s.stages.mastered, className: 'bg-success', hint: '21+ gün aralıkla' },
  ];

  return (
    <>
      <PageHeader
        title="İstatistikler"
        description={`${new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(s.memberSince)} tarihinden beri öğreniyorsun.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile icon={BookCheck} tone="primary" label="Çalışılan" value={formatNumber(s.totals.studied)} hint="farklı kelime" />
        <StatTile icon={Target} tone="success" label="Öğrenilen" value={formatNumber(s.totals.learned)} hint="1+ gün aralıkla" />
        <StatTile icon={Crown} tone="violet" label="Ustalaşılan" value={formatNumber(s.totals.mastered)} hint="21+ gün aralıkla" />
        <StatTile icon={Zap} tone="xp" label="Doğruluk" value={s.totals.accuracy === null ? '—' : `%${s.totals.accuracy}`} hint={`${formatNumber(s.totals.reviews)} cevap`} />
        <StatTile icon={Flame} tone="streak" label="Seri" value={`${s.streak} gün`} hint={`Son 30 günde ${s.totals.activeDays30} aktif gün`} />
        <StatTile icon={CalendarDays} tone="warning" label="Oturum" value={formatNumber(s.totals.sessions)} hint="tamamlanan" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Son 30 gün" description="Her gün çalıştığın kelime sayısı" />
          <CardBody>
            <BarChart
              ariaLabel="Son 30 günde günlük çalışılan kelime sayısı"
              unit="kelime"
              labelEvery={5}
              data={s.trend.map((t, i) => ({ label: t.label, value: t.words, detail: `${formatNumber(t.xp)} XP`, highlight: i === s.trend.length - 1 }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Önümüzdeki 7 gün" description="Tekrarı gelecek kelimeler" />
          <CardBody>
            <BarChart
              ariaLabel="Önümüzdeki 7 günde tekrar edilecek kelime sayısı"
              unit="kelime"
              tone="violet"
              height={160}
              data={s.forecast.map((f, i) => ({ label: f.label, value: f.count, highlight: i === 0 }))}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Hafıza durumu" description="Kelimelerin aralıklı tekrardaki aşamaları" />
          <CardBody>
            <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Aşamalara göre kelime dağılımı">
              {stages.map((st) =>
                st.value > 0 ? (
                  <div key={st.key} className={st.className} style={{ width: `${(st.value / stageTotal) * 100}%` }} title={`${st.label}: ${st.value}`} />
                ) : null,
              )}
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {stages.map((st) => (
                <li key={st.key} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${st.className}`} aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-fg">
                      {st.label} <span className="tabular text-muted">· {formatNumber(st.value)}</span>
                    </p>
                    <p className="text-xs text-muted">{st.hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Konular" description="Çalıştığın kelimelerin dağılımı" />
          <CardBody>
            <HBarList unit="" data={s.categories.slice(0, 7).map((c) => ({ label: CATEGORY_INFO[c.name]?.label ?? c.name, value: c.value }))} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="En çok zorlandıkların"
            action={
              s.weak.length > 0 && (
                <ButtonLink href="/study/multiple-choice?source=weak" variant="soft" size="sm">
                  Bunları çalış
                </ButtonLink>
              )
            }
          />
          {s.weak.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Hiç hata yapmamışsın. Böyle devam!</p>
          ) : (
            <ul className="mt-2 grid gap-x-8 px-5 pb-4 sm:grid-cols-2">
              {s.weak.map((w) => (
                <li key={w.id} className="border-b border-border py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold">{w.word}</span>
                    <span className="shrink-0 text-xs tabular text-muted">%{w.accuracy}</span>
                  </div>
                  <p className="truncate text-sm text-muted">{w.translation}</p>
                  <ProgressBar value={w.accuracy} max={100} tone={w.accuracy < 50 ? 'danger' : 'xp'} className="mt-2 h-1.5" label={`${w.word} doğruluk`} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Modlara göre" description="Hangi modda kaç cevap verdin" />
          <CardBody>
            {s.modes.length === 0 ? (
              <p className="text-sm text-muted">Henüz veri yok.</p>
            ) : (
              <HBarList
                unit="cevap"
                tone="violet"
                data={s.modes.map((m) => ({ label: isStudyMode(m.mode) ? STUDY_MODE_INFO[m.mode].name : m.mode, value: m.count }))}
              />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
