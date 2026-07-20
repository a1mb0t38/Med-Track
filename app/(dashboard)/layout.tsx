import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationManager from '@/components/NotificationManager';
import Header from '@/components/dashboard/Header';
import { fetchServer } from '@/lib/api-server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  const session = fetchServer('/user/profile');

  if (!session) {
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
