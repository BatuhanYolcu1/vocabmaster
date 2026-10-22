import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, BookText, Layers, Sparkles, UserPlus, Users } from 'lucide-react';
import { prisma } from '@/server/db';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar, PageHeader, StatTile } from '@/components/ui/misc';
import { BarChart } from '@/components/charts/bar-chart';
import { dayStamp, lastDays, shortDateLabel, startOfToday, relativeDayLabel } from '@/lib/dates';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Genel bakış' };

export default async function AdminHome() {
  const now = new Date();
  const days = lastDays(14, now);
  const since = new Date(days[0].getTime() - 3 * 3_600_000);
  const todayStart = startOfToday(now);
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  const [users, newToday, newWeek, activeToday, active7, pro, systemWords, customWords, lists, reviewsToday, signups, activity, recent] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { lastStudyDate: { gte: todayStart } } }),
      prisma.user.count({ where: { lastStudyDate: { gte: weekAgo } } }),
      prisma.user.count({ where: { subscriptionType: { in: ['PRO', 'LITE'] } } }),
      prisma.word.count({ where: { isSystem: true } }),
      prisma.word.count({ where: { isSystem: false } }),
      prisma.wordList.count(),
      prisma.reviewLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.dailyActivity.groupBy({ by: ['date'], where: { date: { gte: days[0] }, wordsStudied: { gt: 0 } }, _count: { _all: true } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, name: true, email: true, image: true, createdAt: true } }),
    ]);

  const signupsByDay = new Map<string, number>();
  for (const s of signups) {
    const key = dayStamp(s.createdAt).toISOString();
    signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
  }
  const activeByDay = new Map(activity.map((a) => [a.date.toISOString(), a._count._all]));

  return (
    <>
      <PageHeader title="Genel bakış" description="Platformun bugünkü durumu." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Users} label="Toplam kullanıcı" value={formatNumber(users)} hint={`Bu hafta +${newWeek}`} />
        <StatTile icon={UserPlus} tone="success" label="Bugün kayıt" value={formatNumber(newToday)} />
        <StatTile icon={Activity} tone="streak" label="Bugün aktif" value={formatNumber(activeToday)} hint={`Son 7 gün: ${formatNumber(active7)}`} />
        <StatTile icon={Sparkles} tone="violet" label="Pro üye" value={formatNumber(pro)} hint={users ? `%${Math.round((pro / users) * 100)} oran` : undefined} />
        <StatTile icon={BookText} tone="primary" label="Kütüphane kelimesi" value={formatNumber(systemWords)} hint={`${formatNumber(customWords)} kullanıcı kelimesi`} />
        <StatTile icon={Layers} tone="warning" label="Liste" value={formatNumber(lists)} />
        <StatTile icon={Activity} tone="xp" label="Bugün cevap" value={formatNumber(reviewsToday)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Yeni kayıtlar" description="Son 14 gün" />
          <CardBody>
            <BarChart
              ariaLabel="Son 14 gündeki günlük yeni kayıt sayısı"
              unit="kayıt"
              labelEvery={3}
              data={days.map((d, i) => ({ label: shortDateLabel(d), value: signupsByDay.get(d.toISOString()) ?? 0, highlight: i === days.length - 1 }))}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Aktif kullanıcılar" description="Son 14 gün, gün içinde en az bir kelime çalışanlar" />
          <CardBody>
            <BarChart
              ariaLabel="Son 14 gündeki günlük aktif kullanıcı sayısı"
              unit="kullanıcı"
              tone="success"
              labelEvery={3}
              data={days.map((d, i) => ({ label: shortDateLabel(d), value: activeByDay.get(d.toISOString()) ?? 0, highlight: i === days.length - 1 }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Son kayıt olanlar"
          action={
            <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">
              Tümü
            </Link>
          }
        />
        <ul className="mt-2 divide-y divide-border">
          {recent.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={u.name} image={u.image} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.name ?? '—'}</p>
                <p className="truncate text-xs text-muted">{u.email}</p>
              </div>
              <span className="text-xs text-subtle">{relativeDayLabel(u.createdAt)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
