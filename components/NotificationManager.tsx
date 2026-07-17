'use client';

import { useEffect } from 'react';
import { fetchClient } from '@/lib/api';
import { registerServiceWorker, scheduleNotificationsForToday } from '@/lib/notifications';
import { Dose } from './dashboard/TodayScheduleCard';

export default function NotificationManager() {
  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      // 1. Register Service Worker
      await registerServiceWorker();

      // 2. Fetch Doses and Schedule
      const fetchAndSchedule = async () => {
        try {
          const res = await fetchClient('/doses/today');
          if (res.success && isMounted) {
            scheduleNotificationsForToday(res.data as Dose[]);
          }
        } catch (error) {
          console.error('Failed to fetch doses for notifications', error);
        }
      };

      await fetchAndSchedule();

      // 3. Listen for dose updates to reschedule
      const handleDoseUpdated = () => {
        fetchAndSchedule();
      };

      window.addEventListener('dose-updated', handleDoseUpdated);

      return () => {
        window.removeEventListener('dose-updated', handleDoseUpdated);
      };
    };

    setupNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // This is a logic-only component, it renders nothing.
  return null;
}
