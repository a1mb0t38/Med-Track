import React from 'react';
import AdherenceDashboard from '@/components/history/AdherenceDashboard';

export const metadata = {
  title: 'Adherence History | MedTrack',
};

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Adherence History</h1>
        <p className="text-slate-500 mt-1">Review your medication adherence over time.</p>
      </div>

      <AdherenceDashboard />
    </div>
  );
}
