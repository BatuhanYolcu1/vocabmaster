import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getSessionUserId } from '@/server/session';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const signedIn = Boolean(await getSessionUserId());
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
