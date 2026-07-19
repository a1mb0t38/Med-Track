'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@heroui/react';
import { fetchClient } from '@/lib/api';

interface Medicine {
  _id: string;
  name: string;
  pillsRemaining: number;
  lowStockThreshold: number;
}

export default function RefillAlertBanner() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRefills = async () => {
      try {
        const data = await fetchClient('/medicines');
        if (data.success && Array.isArray(data.data)) {
          const lowStock = data.data.filter(
            (med: Medicine) => med.pillsRemaining <= med.lowStockThreshold
          );
          setMedicines(lowStock);
        }
      } catch (error) {
        console.error('Error fetching medicines for refill alert:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRefills();
  }, []);

  if (loading || !isVisible || medicines.length === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6 shadow-sm">
      <CardContent className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">
            Refill Reminder
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            You are running low on:{' '}
            <span className="font-medium">
              {medicines.map((m) => m.name).join(', ')}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="ml-4 text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
          onPress={() => setIsVisible(false)}
        >
          Dismiss
        </Button>
      </CardContent>
    </Card>
  );
}