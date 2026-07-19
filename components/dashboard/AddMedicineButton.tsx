'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  useOverlayState,
  TextField,
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
      <Button className="font-semibold shadow-md bg-primary-600 text-white hover:bg-primary-700" onPress={state.open}>
        + Add Medicine
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-2xl max-h-[85vh] flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <Modal.Header>
                <Modal.Heading>Add New Medicine</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">

                <div className="flex gap-4">
                  <TextField
                    name="name"
                    isRequired
                    value={name}
                    onChange={setName}
                    className="flex-1 flex flex-col gap-1.5"
                  >
                    <Label>Medicine Name</Label>
                    <Input placeholder="e.g. Lisinopril" />
                  </TextField>

                  <TextField
                    name="dosage"
                    isRequired
                    value={dosage}
                    onChange={setDosage}
                    className="flex-1 flex flex-col gap-1.5"
                  >
                    <Label>Dosage</Label>
                    <Input placeholder="e.g. 10mg" />
                  </TextField>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label>Doses per day</Label>
                    <Input
                      type="number"
                      min={1}
                      value={frequencyPerDay.toString()}
                      onChange={handleFrequencyChange}
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label>Pills taken per dose</Label>
                    <Input
                      type="number"
                      min={1}
                      value={pillsPerDose.toString()}
                      onChange={(e) => setPillsPerDose(parseInt(e.target.value) || 1)}
                    />
                  </div>
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
                        required
                        aria-label={`Time ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label>Total Pills Remaining</Label>
                    <Input
                      type="number"
                      min={0}
                      value={pillsRemaining.toString()}
                      onChange={(e) => setPillsRemaining(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label>Low Stock Alert Threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      value={lowStockThreshold.toString()}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Switch isSelected={isOngoing} onChange={setIsOngoing}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label>Ongoing Prescription</Label>
                  </Switch>
                  {!isOngoing && (
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Instructions / Notes</Label>
                  <TextArea
                    placeholder="e.g. Take with food"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

              </Modal.Body>

              <Modal.Footer>
                <Button
                  className="font-medium bg-danger-50 text-danger-700 hover:bg-danger-100"
                  onPress={() => state.close()}
                >
                  Cancel
                </Button>
                <Button
                  className="font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                  type="submit"
                  isDisabled={isLoading}
                >
                  {isLoading ? 'Adding…' : 'Add Medicine'}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}