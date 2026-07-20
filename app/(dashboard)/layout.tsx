import React from 'react';
import { redirect } from 'next/navigation';
import NotificationManager from '@/components/NotificationManager';
import Header from '@/components/dashboard/Header';
import { fetchServer } from '@/lib/api-server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  let session: any = null;

  try {
    session = await fetchServer('/user/profile');
  } catch (error) {
    session = null;
  }

  if (!session?.success || !session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <Header user={session.user as any} />
      <NotificationManager />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}