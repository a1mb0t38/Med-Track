'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { fetchClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { format, isPast, differenceInMinutes, parseISO } from 'date-fns';

export interface Dose {
  _id: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  medicineId: {
    _id: string;
    name: string;
    dosage: string;
  };
}

interface TodayScheduleCardProps {
  initialDoses: Dose[];
}

type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

const getTimeOfDay = (dateStr: string): TimeOfDay => {
  const date = parseISO(dateStr);
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
};

export default function TodayScheduleCard({ initialDoses }: TodayScheduleCardProps) {
  const [doses, setDoses] = useState<Dose[]>(initialDoses);

  const handleUpdateStatus = async (id: string, status: 'taken' | 'skipped') => {
    // Optimistic UI update
    setDoses((prev) => 
      prev.map((dose) => (dose._id === id ? { ...dose, status } : dose))
    );

    try {
      const res = await fetchClient(`/doses/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      if (res.success) {
        toast.success(`Dose marked as ${status}`);
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      console.error('Failed to update dose status', error);
      toast.error('Failed to update dose status');
      // Revert optimistic update on failure by resetting to initial state
      // A more robust approach might refetch, but this is okay for now
      setDoses(initialDoses);
    }
  };

  const groupedDoses: Record<TimeOfDay, Dose[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
    Night: [],
  };

  doses.forEach((dose) => {
    groupedDoses[getTimeOfDay(dose.scheduledTime)].push(dose);
  });

  const renderDoseGroup = (title: string, groupDoses: Dose[]) => {
    if (groupDoses.length === 0) return null;

    return (
      <div key={title} className="mb-8">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 px-1 border-b border-slate-200 dark:border-slate-700 pb-2">
          {title}
        </h3>
        <div className="flex flex-col gap-3">
          {groupDoses.map((dose) => {
            const scheduledDate = parseISO(dose.scheduledTime);
            const isOverdue = dose.status === 'pending' && isPast(scheduledDate) && differenceInMinutes(new Date(), scheduledDate) > 30;

            return (
              <Card 
                key={dose._id} 
                className={`shadow-sm border transition-all ${
                  isOverdue ? 'border-l-4 border-l-danger-500 border-default-200' : 'border-default-200'
                }`}
              >
                <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {dose.medicineId.name}
                      </span>
                      {isOverdue && (
                        <Chip size="sm" color="danger" variant="flat">Overdue</Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span>{dose.medicineId.dosage}</span>
                      <span>&bull;</span>
                      <span className="font-medium text-primary-600 dark:text-primary-400">
                        {format(scheduledDate, 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {dose.status === 'pending' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="flat" 
                          className="bg-slate-200 text-slate-700 font-medium"
                          onPress={() => handleUpdateStatus(dose._id, 'skipped')}
                        >
                          Skip
                        </Button>
                        <Button 
                          size="sm" 
                          color="success" 
                          className="font-medium text-white"
                          onPress={() => handleUpdateStatus(dose._id, 'taken')}
                        >
                          Mark Taken
                        </Button>
                      </>
                    ) : (
                      <Chip 
                        color={
                          dose.status === 'taken' ? 'success' : 
                          dose.status === 'missed' ? 'danger' : 'default'
                        } 
                        variant="dot"
                        className="capitalize"
                      >
                        {dose.status}
                      </Chip>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (doses.length === 0) {
    return (
      <Card className="shadow-sm border border-default-200 bg-white/50 dark:bg-default-100/50">
        <CardBody className="p-8 text-center text-slate-500">
          No doses scheduled for today.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      {renderDoseGroup('Morning', groupedDoses.Morning)}
      {renderDoseGroup('Afternoon', groupedDoses.Afternoon)}
      {renderDoseGroup('Evening', groupedDoses.Evening)}
      {renderDoseGroup('Night', groupedDoses.Night)}
    </div>
  );
}
