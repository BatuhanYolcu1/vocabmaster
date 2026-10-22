import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/server/session';
import { OnboardingFlow } from './onboarding-flow';
import { firstName } from '@/lib/utils';

export const metadata: Metadata = { title: 'Hoş geldin' };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingComplete) redirect('/dashboard');
  return <OnboardingFlow name={firstName(user.name)} />;
}
