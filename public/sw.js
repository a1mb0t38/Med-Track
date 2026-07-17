self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REMINDER') {
    const { medicineName, dosage, time } = event.data;
    
    self.registration.showNotification(`Time for ${medicineName}`, {
      body: `Take your dose of ${dosage}. Scheduled for ${time}.`,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true,
      tag: `reminder-${medicineName}-${time}`,
    });
  }
});

// Handle clicking on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Focus or open the dashboard
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
