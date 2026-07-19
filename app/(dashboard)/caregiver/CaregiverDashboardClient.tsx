'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Input, Label, Button, CardHeader } from '@heroui/react';
import { fetchClient } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Patient {
  _id: string;
  name: string;
  email: string;
}

interface TodaySummary {
  taken: number;
  total: number;
}

interface LinkedPatientLink {
  _id: string;
  caregiverId: string;
  patientId: Patient;
  status: 'accepted';
  todaySummary: TodaySummary;
  createdAt: string;
}

interface SentInviteLink {
  _id: string;
  caregiverId: string;
  patientId?: Patient;
  status: 'pending';
  invitedEmail: string;
  createdAt: string;
}

interface CaregiverDashboardClientProps {
  initialPatients: LinkedPatientLink[];
  initialSentInvites: SentInviteLink[];
}

export default function CaregiverDashboardClient({
  initialPatients,
  initialSentInvites,
}: CaregiverDashboardClientProps) {
  const [patients, setPatients] = useState<LinkedPatientLink[]>(initialPatients);
  const [invites, setInvites] = useState<SentInviteLink[]>(initialSentInvites);
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a patient email');
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetchClient('/links/invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.success) {
        toast.success(res.message || 'Invitation sent successfully!');
        const newInvite: SentInviteLink = res.data;
        setInvites((prev) => [newInvite, ...prev]);
        setEmail('');
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error('Failed to send invite:', error);
      toast.error(error.message || 'Failed to send invite. Make sure patient exists.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUnlink = async (linkId: string, isInvite: boolean) => {
    if (!confirm(`Are you sure you want to ${isInvite ? 'revoke this invitation' : 'unlink this patient'}?`)) {
      return;
    }

    setIsProcessingId(linkId);
    try {
      const res = await fetchClient(`/links/${linkId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        toast.success(isInvite ? 'Invitation revoked' : 'Patient unlinked successfully');
        if (isInvite) {
          setInvites((prev) => prev.filter((inv) => inv._id !== linkId));
        } else {
          setPatients((prev) => prev.filter((pat) => pat._id !== linkId));
        }
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error('Failed to unlink/revoke:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Caregiver Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage and track your linked patients' medication adherence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border border-slate-200 dark:border-slate-850 shadow-sm h-fit">
          <CardHeader className="px-6 pt-6 pb-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Invite Patient</h2>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-4">
              Enter the email address of the patient you want to link. They will see a banner on their dashboard to accept.
            </p>
            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <TextField
                name="email"
                type="email"
                isRequired
                value={email}
                onChange={setEmail}
                className="flex flex-col gap-1.5"
              >
                <Label>Patient Email</Label>
                <Input placeholder="patient@example.com" />
              </TextField>
              <Button
                type="submit"
                className="font-semibold w-full mt-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                isDisabled={isInviting}
              >
                {isInviting ? 'Sending…' : 'Send Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-850 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pending Sent Invites</h2>
          </CardHeader>
          <CardContent className="p-6">
            {invites.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">No pending invitations.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {invites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex flex-row items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {invite.patientId ? invite.patientId.name : 'Unregistered User'}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {invite.invitedEmail}
                      </span>
                    </div>
                    <Button
                      className="font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-60"
                      isDisabled={isProcessingId === invite._id}
                      onPress={() => handleUnlink(invite._id, true)}
                    >
                      {isProcessingId === invite._id ? 'Revoking…' : 'Revoke'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Linked Patients</h2>

        {patients.length === 0 ? (
          <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-55/20 dark:bg-slate-900/10">
            <CardContent className="p-12 text-center text-slate-500">
              No patients linked yet. Send an invitation above to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((link) => {
              const { patientId: patient, todaySummary } = link;
              const adherencePercentage = todaySummary.total > 0
                ? Math.round((todaySummary.taken / todaySummary.total) * 100)
                : 0;

              return (
                <Card
                  key={link._id}
                  className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex flex-col justify-between min-h-[180px]">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50">{patient.name}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{patient.email}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-sm font-medium text-slate-550 dark:text-slate-400">
                          Today's Adherence Summary:
                        </p>
                        <p className="text-xl font-bold text-slate-850 dark:text-slate-200 mt-1">
                          {todaySummary.taken}/{todaySummary.total} doses taken today
                          {todaySummary.total > 0 && (
                            <span className="text-xs text-slate-400 font-normal ml-2">
                              ({adherencePercentage}%)
                            </span>
                          )}
                        </p>
                        {todaySummary.total > 0 && (
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${adherencePercentage === 100
                                  ? 'bg-success'
                                  : adherencePercentage > 50
                                    ? 'bg-primary'
                                    : 'bg-warning'
                                }`}
                              style={{ width: `${adherencePercentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <Button
                        className="font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-60"
                        isDisabled={isProcessingId === link._id}
                        onPress={() => handleUnlink(link._id, false)}
                      >
                        {isProcessingId === link._id ? 'Unlinking…' : 'Unlink'}
                      </Button>

                      <Link href={`/caregiver/${patient._id}`}>
                        <Button className="font-semibold px-4 bg-primary-600 text-white hover:bg-primary-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}