'use client';

import { useSession } from 'next-auth/react';
import DashboardHome from '@/components/dashboard/DashboardHome';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f17]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#135bec]"></div>
      </div>
    );
  }

  // If authenticated, show Dashboard
  if (session) {
    return <DashboardHome />;
  }

  // If not authenticated, show Landing Page
  return <LandingPage />;
}
