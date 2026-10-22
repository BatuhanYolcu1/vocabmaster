import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookCheck, Crown, Flame, Layers, Play, Plus, Sparkles, Target, Zap } from 'lucide-react';
import { requireOnboardedUser } from '@/server/session';
import { getDashboardData } from '@/server/stats';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ProgressBar, ProgressRing } from '@/components/ui/progress';
import { EmptyState, StatTile } from '@/components/ui/misc';
import { BarChart } from '@/components/charts/bar-chart';
import { firstName, formatNumber } from '@/lib/utils';
import { hourInTurkey } from '@/lib/dates';

export const metadata: Metadata = { title: 'Bugün' };

function greeting() {
  const h = hourInTurkey();
  if (h < 5) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const d = await getDashboardData(user.id);
  const goalDone = d.todayWords >= d.dailyGoal;
  const isNew = d.studied === 0;

  let headline: string;
  let sub: string;
  if (isNew) {
    headline = 'İlk çalışmana hazırsın';
    sub = `Seviyene (${user.languageLevel}) ve ilgi alanlarına göre seçilmiş kelimelerle başlayalım. Yaklaşık 5 dakika sürer.`;
  } else if (d.dueNow > 0) {
    headline = `${d.dueNow} kelimenin tekrar zamanı geldi`;
    sub = 'Unutmadan hemen önce tekrar etmek, kelimeyi kalıcı hafızaya taşır.';
  } else if (!goalDone) {
    headline = 'Tekrarların tamam, sırada yeni kelimeler var';
    sub = `Günlük hedefine ${d.dailyGoal - d.todayWords} kelime kaldı.`;
  } else {
    headline = 'Bugünkü hedefini tamamladın';
    sub = d.dueLaterToday > 0 ? `Gün içinde ${d.dueLaterToday} kelime daha tekrara düşecek.` : 'Harika iş! Yarın görüşmek üzere — ya da bir tur daha?';
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{firstName(d.name)}</h1>
      </div>

      {/* Today */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-fg shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-28 right-24 size-56 rounded-full bg-white/5" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className="relative grid size-28 shrink-0 place-items-center"
            role="progressbar"
            aria-label="Günlük hedef"
            aria-valuenow={d.todayWords}
            aria-valuemax={d.dailyGoal}
          >
            <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="10" />
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(1, d.todayWords / d.dailyGoal))}
              />
            </svg>
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold tabular">
                {Math.min(d.todayWords, 999)}
                <span className="text-base font-bold opacity-70">/{d.dailyGoal}</span>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider opacity-80">bugün</div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">{headline}</h2>
            <p className="mt-1.5 max-w-xl text-[15px] opacity-90">{sub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/study/flashcard?source=daily"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-primary shadow-sm transition hover:bg-white/90 active:scale-[0.98]"
              >
                <Play className="size-4 fill-current" />
                {isNew ? 'Hemen başla' : goalDone && d.dueNow === 0 ? 'Bir tur daha' : 'Çalışmaya başla'}
              </Link>
              <Link
                href="/study"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                Başka mod seç
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={Flame}
          tone="streak"
          label="Günlük seri"
          value={`${d.streak} gün`}
          hint={d.studiedToday ? 'Bugün korundu' : d.streak > 0 ? 'Bugün çalışırsan uzar' : 'Bugün başlat'}
        />
        <StatTile icon={BookCheck} tone="success" label="Öğrenilen" value={formatNumber(d.learned)} hint={`${formatNumber(d.studied)} kelime çalışıldı`} />
        <StatTile icon={Crown} tone="violet" label="Ustalaşılan" value={formatNumber(d.mastered)} hint="21+ gün aralıkla hatırlanan" />
        <StatTile icon={Zap} tone="xp" label="Bugün kazanılan" value={`${formatNumber(d.todayXp)} XP`} hint={`${d.todaySessions} oturum tamamlandı`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Son 7 gün"
              description="Her gün çalıştığın kelime sayısı"
              action={
                <Link href="/stats" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Ayrıntılar <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <CardBody>
              <BarChart
                ariaLabel="Son 7 günde çalışılan kelime sayısı"
                unit="kelime"
                data={d.week.map((w, i) => ({
                  label: i === d.week.length - 1 ? 'Bugün' : w.label,
                  value: w.words,
                  detail: `${formatNumber(w.xp)} XP`,
                  highlight: i === d.week.length - 1,
                }))}
              />
            </CardBody>
          </Card>

          {isNew && (
            <Card>
              <CardHeader title="VocabMaster nasıl çalışır?" />
              <CardBody>
                <ol className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Play, t: 'Her gün birkaç dakika', b: 'Kartlar, testler ve oyunlarla kelimeleri çalış.' },
                    { icon: Target, t: 'Zamanında tekrar', b: 'Uygulama her kelimeyi unutmak üzereyken karşına çıkarır.' },
                    { icon: Sparkles, t: 'Kalıcı öğrenme', b: 'Tekrar aralıkları uzadıkça kelime kalıcı hafızaya yerleşir.' },
                  ].map(({ icon: Icon, t, b }, i) => (
                    <li key={t} className="rounded-xl bg-surface-2 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Icon className="size-4" /> {i + 1}. adım
                      </div>
                      <p className="mt-2 font-semibold text-fg">{t}</p>
                      <p className="mt-0.5 text-sm text-muted">{b}</p>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Zorlandığın kelimeler"
              description="En çok yanlış yaptıkların"
              action={
                d.weak.length > 0 && (
                  <ButtonLink href="/study/multiple-choice?source=weak" variant="soft" size="sm">
                    Bunları çalış
                  </ButtonLink>
                )
              }
            />
            {d.weak.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Henüz zorlandığın bir kelime yok"
                description="Çalıştıkça burada en çok hata yaptığın kelimeler belirecek."
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-border px-5 pb-2 pt-3">
                {d.weak.map((w) => (
                  <li key={w.id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{w.word}</p>
                      <p className="truncate text-sm text-muted">{w.translation}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <div className="mb-1 text-right text-xs tabular text-muted">%{w.accuracy} doğru</div>
                      <ProgressBar value={w.accuracy} max={100} tone={w.accuracy < 50 ? 'danger' : 'xp'} label={`${w.word} doğruluk`} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="flex items-center gap-4">
              <ProgressRing value={d.level.progress} max={1} size={76} stroke={8} tone="xp" label="Seviye ilerlemesi">
                <span className="font-display text-xl font-extrabold tabular">{d.level.level}</span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">Seviye {d.level.level}</p>
                <p className="font-display text-lg font-bold text-fg">{d.level.title}</p>
                <p className="text-sm text-muted">
                  Sonraki seviyeye <span className="font-semibold tabular text-fg">{formatNumber(d.level.xpToNext)} XP</span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Listelerim"
              action={
                <ButtonLink href="/lists/new" variant="ghost" size="icon-sm" aria-label="Yeni liste">
                  <Plus />
                </ButtonLink>
              }
            />
            {d.lists.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Henüz listen yok"
                description="Okuduğun kitaptan, dizilerden ya da sınav kaynaklarından kendi listeni oluştur."
                action={
                  <ButtonLink href="/lists/new" size="sm">
                    <Plus /> Liste oluştur
                  </ButtonLink>
                }
                className="py-8"
              />
            ) : (
              <ul className="space-y-1 p-3">
                {d.lists.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lists/${l.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary-soft-fg">
                        <Layers className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-fg">{l.name}</span>
                        <span className="block text-xs text-muted">{l.count} kelime</span>
                      </span>
                      <ArrowRight className="size-4 text-subtle" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/lists" className="block px-2 pt-2 text-sm font-medium text-primary hover:underline">
                    Tüm listeler
                  </Link>
                </li>
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden">
            <Link href="/library" className="flex items-center gap-4 p-5 transition-colors hover:bg-surface-2">
              <span className="grid size-11 place-items-center rounded-xl bg-success-soft text-success">
                <BookCheck className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fg">Kütüphaneyi keşfet</span>
                <span className="block text-sm text-muted">Seviyelere ve konulara ayrılmış hazır kelimeler</span>
              </span>
              <ArrowRight className="size-4 text-subtle" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
