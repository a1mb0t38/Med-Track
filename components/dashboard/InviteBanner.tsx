'use client';

import React, { useState } from 'react';
import { Card, CardContent, Button } from '@heroui/react';
import { fetchClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CaregiverInfo {
  _id: string;
  name: string;
  email: string;
}

interface Invite {
  _id: string;
  caregiverId: CaregiverInfo | null;
  status: 'pending';
}

interface InviteBannerProps {
  initialInvites: Invite[];
}

export default function InviteBanner({ initialInvites }: InviteBannerProps) {
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handleRespond = async (inviteId: string, action: 'accept' | 'decline') => {
    setIsProcessing(inviteId);
    try {
      const res = await fetchClient(`/links/${inviteId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });

      if (res.success) {
        toast.success(`Invitation ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
        setInvites((prev) => prev.filter((inv) => inv._id !== inviteId));
        router.refresh();
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      console.error(`Failed to respond to invite:`, error);
      toast.error(error.message || `Failed to ${action} invitation`);
    } finally {
      setIsProcessing(null);
    }
  };

  const validInvites = invites.filter((invite) => invite.caregiverId !== null);

  if (validInvites.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {validInvites.map((invite) => (
        <Card
          key={invite._id}
          className="border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-950/10 shadow-sm"
        >
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-400 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  Caregiver Connection Request
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {invite.caregiverId!.name}
                  </span>{' '}
                  ({invite.caregiverId!.email}) wants to link accounts to view your medication adherence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                className="font-medium bg-danger-50 text-danger-700 hover:bg-danger-100"
                isDisabled={isProcessing !== null}
                onPress={() => handleRespond(invite._id, 'decline')}
              >
                Decline
              </Button>
              <Button
                className="font-medium px-4 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                isDisabled={isProcessing !== null}
                onPress={() => handleRespond(invite._id, 'accept')}
              >
                {isProcessing === invite._id ? 'Accepting…' : 'Accept'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}