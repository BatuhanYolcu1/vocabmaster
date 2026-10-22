import type { Metadata } from 'next';
import { requireOnboardedUser } from '@/server/session';
import { getPlanInfo } from '@/server/plan';
import { PageHeader } from '@/components/ui/misc';
import { SettingsView } from './settings-view';

export const metadata: Metadata = { title: 'Ayarlar' };

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const plan = await getPlanInfo(user.id);
  return (
    <>
      <PageHeader title="Ayarlar" description="Profilin, öğrenme tercihlerin ve hesabın." />
      <SettingsView
        user={{
          name: user.name ?? '',
          email: user.email,
          image: user.image,
          languageLevel: user.languageLevel,
          dailyGoal: user.dailyGoal,
          interests: user.interests.split(',').map((s) => s.trim()).filter(Boolean),
          hasPassword: user.hasPassword,
        }}
        plan={{
          plan: plan.plan,
          endsAt: plan.endsAt?.toISOString() ?? null,
          aiUsedToday: plan.aiUsedToday,
          aiLimit: Number.isFinite(plan.limits.dailyAiLimit) ? plan.limits.dailyAiLimit : null,
        }}
      />
    </>
  );
}
