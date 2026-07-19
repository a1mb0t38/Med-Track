'use client';

import React, { use, useState, useEffect } from 'react';
import { fetchClient } from '@/lib/api';
import TodayScheduleCard, { Dose } from '@/components/dashboard/TodayScheduleCard';
import AdherenceDashboard from '@/components/history/AdherenceDashboard';
import { Card, CardContent, Button } from '@heroui/react';
import Link from 'next/link';

interface PatientDetailsPageProps {
  params: Promise<{ patientId: string }>;
}

interface PatientInfo {
  _id: string;
  name: string;
  email: string;
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const { patientId } = use(params);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      setHasAccess(true);
      setErrorMessage('');
      try {
        const res = await fetchClient(`/links/patients/${patientId}/doses`);
        if (res.success && res.data) {
          setDoses(res.data.todayDoses || []);
          setPatient(res.data.patient || null);
        } else {
          throw new Error(res.message || 'Failed to load patient data');
        }
      } catch (error: any) {
        console.error('Error fetching patient details:', error);
        const msg = error.message || '';
        if (msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('unauthorized') || msg.includes('403') || msg.toLowerCase().includes('access')) {
          setHasAccess(false);
        } else {
          setErrorMessage(msg || 'An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border border-danger-200 dark:border-danger-900 bg-danger-50/20 dark:bg-danger-950/10 shadow-sm">
          <CardContent className="p-8 text-center flex flex-col items-center gap-4">
            <div className="p-3 bg-danger-100 dark:bg-danger-900/30 rounded-full text-danger-600 dark:text-danger-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V9m0 12a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              You don't have access to this patient's data.
            </p>
            <Link href="/caregiver">
              <Button className="mt-2 font-semibold bg-primary-600 text-white hover:bg-primary-700">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border border-warning-200 dark:border-warning-900 bg-warning-50/20 dark:bg-warning-950/10 shadow-sm">
          <CardContent className="p-8 text-center flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Error Loading Data</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">{errorMessage}</p>
            <Link href="/caregiver">
              <Button className="font-semibold bg-primary-600 text-white hover:bg-primary-700">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <Link href="/caregiver" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Patients
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {patient?.name}'s Adherence
        </h1>
        <p className="text-slate-500 mt-1">Viewing schedule and history for {patient?.email}.</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-4">Today's Schedule</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <TodayScheduleCard initialDoses={doses} readOnly={true} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-4">Adherence Progress</h2>
        <AdherenceDashboard patientId={patientId} />
      </div>
    </div>
  );
}