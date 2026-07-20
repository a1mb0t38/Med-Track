import React from 'react';
import { fetchServer } from '@/lib/api-server';
import TodayScheduleCard from '@/components/dashboard/TodayScheduleCard';
import RefillAlertBanner from '@/components/dashboard/RefillAlertBanner';
import AddMedicineButton from '@/components/dashboard/AddMedicineButton';
import InviteBanner from '@/components/dashboard/InviteBanner';
import { Dose } from '@/components/dashboard/TodayScheduleCard';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  const session = await fetchServer('/user/profile');

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'caregiver') {
    redirect('/caregiver');
  }

  let doses: Dose[] = [];
  let invites = [];

  try {
    const res = await fetchServer('/doses/today', { cache: 'no-store' });
    if (res.success && Array.isArray(res.data)) {
      doses = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch today doses:', error);
  }

  try {
    const res = await fetchServer('/links/invites', { cache: 'no-store' });
    if (res.success && Array.isArray(res.data)) {
      invites = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch pending invites:', error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <InviteBanner initialInvites={invites} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your health and stay on track.</p>
        </div>
        <AddMedicineButton />
      </div>

      <RefillAlertBanner />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <TodayScheduleCard initialDoses={doses} />
      </div>
    </div>
  );
}