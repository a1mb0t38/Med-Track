'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  useOverlayState,
  Input,
  TextArea,
  Switch,
  Label,
} from '@heroui/react';
import { fetchClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AddMedicineButton() {
  const state = useOverlayState();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [pillsRemaining, setPillsRemaining] = useState(30);
  const [pillsPerDose, setPillsPerDose] = useState(1);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [notes, setNotes] = useState('');
  const [isOngoing, setIsOngoing] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const freq = parseInt(e.target.value) || 1;
    setFrequencyPerDay(freq);

    setTimes((prev) => {
      const newTimes = [...prev];
      if (freq > newTimes.length) {
        for (let i = newTimes.length; i < freq; i++) {
          newTimes.push('12:00');
        }
      } else {
        newTimes.length = freq;
      }
      return newTimes;
    });
  };

  const handleTimeChange = (index: number, val: string) => {
    setTimes((prev) => {
      const newTimes = [...prev];
      newTimes[index] = val;
      return newTimes;
    });
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequencyPerDay(1);
    setTimes(['08:00']);
    setPillsRemaining(30);
    setPillsPerDose(1);
    setLowStockThreshold(5);
    setNotes('');
    setIsOngoing(true);
    setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || frequencyPerDay < 1) {
      toast.error('Please fill required fields (Name, Dosage, Frequency)');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        dosage,
        frequencyPerDay,
        times,
        pillsRemaining,
        pillsPerDose,
        lowStockThreshold,
        notes,
        ...(!isOngoing && endDate ? { endDate } : {}),
      };

      const res = await fetchClient('/medicines', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success('Medicine added successfully');
        state.close();
        resetForm();

        // Refresh server components to show the newly generated doses/refills
        // Note: The backend cron needs to be run, or we wait till midnight.
        // For testing, just refreshing the page state.
        router.refresh();
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add medicine');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal state={state}>
      <Button color="primary" className="font-semibold shadow-md" onPress={state.open}>
        + Add Medicine
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <Modal.Header>
                <Modal.Heading>Add New Medicine</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

                <div className="flex gap-4">
                  <Input
                    label="Medicine Name"
                    placeholder="e.g. Lisinopril"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isRequired
                    className="flex-1"
                  />
                  <Input
                    label="Dosage"
                    placeholder="e.g. 10mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    isRequired
                    className="flex-1"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    label="Doses per day"
                    min={1}
                    value={frequencyPerDay.toString()}
                    onChange={handleFrequencyChange}
                    isRequired
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    label="Pills taken per dose"
                    min={1}
                    value={pillsPerDose.toString()}
                    onChange={(e) => setPillsPerDose(parseInt(e.target.value) || 1)}
                    className="flex-1"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Schedule Times</p>
                  <div className="flex flex-wrap gap-3">
                    {times.map((t, idx) => (
                      <Input
                        key={idx}
                        type="time"
                        value={t}
                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                        className="w-32"
                        isRequired
                        aria-label={`Time ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Input
                    type="number"
                    label="Total Pills Remaining"
                    min={0}
                    value={pillsRemaining.toString()}
                    onChange={(e) => setPillsRemaining(parseInt(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    label="Low Stock Alert Threshold"
                    min={0}
                    value={lowStockThreshold.toString()}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Switch isSelected={isOngoing} onChange={setIsOngoing}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label>Ongoing Prescription</Label>
                  </Switch>
                  {!isOngoing && (
                    <Input
                      type="date"
                      label="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>

                <TextArea
                  label="Instructions / Notes"
                  placeholder="e.g. Take with food"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

              </Modal.Body>

              <Modal.Footer>
                <Button color="danger" variant="flat" onPress={() => state.close()}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                  Add Medicine
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}