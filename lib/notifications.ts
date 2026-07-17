import { Dose } from '@/components/dashboard/TodayScheduleCard';
import { format, parseISO } from 'date-fns';

// Store global timeout IDs so we can clear them when doses are updated
let scheduledTimeouts: NodeJS.Timeout[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      return registration;
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  }
}

export function scheduleNotificationsForToday(doses: Dose[]) {
  // Clear any existing timeouts to prevent stale notifications
  scheduledTimeouts.forEach(clearTimeout);
  scheduledTimeouts = [];

  // Check if notifications are enabled via localStorage
  const isEnabled = localStorage.getItem('medtrack_notifications_enabled') === 'true';
  if (!isEnabled || Notification.permission !== 'granted') {
    return;
  }

  const now = Date.now();

  doses.forEach((dose) => {
    // Only schedule for pending doses
    if (dose.status !== 'pending') return;

    const scheduledDate = parseISO(dose.scheduledTime);
    const scheduledTimeMs = scheduledDate.getTime();
    
    // Calculate delay
    const delay = scheduledTimeMs - now;
    
    // If it's in the future (plus a 5 second grace period to prevent instant triggers on load for exact times)
    if (delay > -5000) {
      // If it's already slightly past due, just trigger it now (delay = 0)
      const triggerDelay = Math.max(0, delay);

      const timeoutId = setTimeout(() => {
        // Send message to service worker
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'REMINDER',
            medicineName: dose.medicineId.name,
            dosage: dose.medicineId.dosage,
            time: format(scheduledDate, 'h:mm a')
          });
        }
      }, triggerDelay);

      scheduledTimeouts.push(timeoutId);
    }
  });

  console.log(`Scheduled ${scheduledTimeouts.length} dose reminders.`);
}
