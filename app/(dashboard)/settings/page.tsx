'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Switch } from '@heroui/react';
import { requestNotificationPermission } from '@/lib/notifications';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preference from local storage
    const stored = localStorage.getItem('medtrack_notifications_enabled');
    if (stored === 'true') {
      setNotificationsEnabled(true);
    }
    setIsLoaded(true);
  }, []);

  const handleToggle = async (isSelected: boolean) => {
    if (isSelected) {
      // Request permissions
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('medtrack_notifications_enabled', 'true');
        toast.success('Notifications enabled');
        
        // Dispatch event to force NotificationManager to re-schedule
        window.dispatchEvent(new Event('dose-updated'));
      } else {
        toast.error('Notification permission denied by the browser');
        setNotificationsEnabled(false);
        localStorage.setItem('medtrack_notifications_enabled', 'false');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('medtrack_notifications_enabled', 'false');
      toast.success('Notifications disabled');
      
      // Dispatch event so NotificationManager clears timeouts
      window.dispatchEvent(new Event('dose-updated'));
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your app preferences.</p>
      </div>

      <Card className="shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Dose Reminders
              </h3>
              <p className="text-sm text-slate-500 max-w-lg mt-1">
                Receive browser notifications when it's time to take your medicine. 
                <br/><br/>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Note: MedTrack must be open in a browser tab for reminders to trigger. 
                  If you completely close the browser or tab, you will not receive alerts.
                </span>
              </p>
            </div>
            <Switch 
              isSelected={notificationsEnabled} 
              onValueChange={handleToggle}
              color="primary"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
