import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchServer } from '@/lib/api';
import CaregiverDashboardClient from './CaregiverDashboardClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Caregiver Dashboard | MedTrack',
};

export default async function CaregiverPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'caregiver') {
    redirect('/dashboard');
  }

  let initialPatients = [];
  let initialSentInvites = [];

  try {
    const patientsRes = await fetchServer('/links/patients', { cache: 'no-store' });
    if (patientsRes.success && Array.isArray(patientsRes.data)) {
      initialPatients = patientsRes.data;
    }
  } catch (error) {
    console.error('Failed to fetch linked patients:', error);
  }

  try {
    const invitesRes = await fetchServer('/links/sent-invites', { cache: 'no-store' });
    if (invitesRes.success && Array.isArray(invitesRes.data)) {
      initialSentInvites = invitesRes.data;
    }
  } catch (error) {
    console.error('Failed to fetch sent invites:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CaregiverDashboardClient
        initialPatients={initialPatients}
        initialSentInvites={initialSentInvites}
      />
    </div>
  );
}
