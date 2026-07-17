'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Input,
  Textarea,
  Switch
} from '@heroui/react';
import { fetchClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AddMedicineButton() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
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
    
    // Adjust times array length
    setTimes((prev) => {
      const newTimes = [...prev];
      if (freq > newTimes.length) {
        // Add default times
        for (let i = newTimes.length; i < freq; i++) {
          newTimes.push('12:00');
        }
      } else {
        // Truncate
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
        ...( !isOngoing && endDate ? { endDate } : {} )
      };

      const res = await fetchClient('/medicines', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success('Medicine added successfully');
        onClose();
        
        // Reset form
        setName('');
        setDosage('');
        setFrequencyPerDay(1);
        setTimes(['08:00']);
        setPillsRemaining(30);
        
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
    <>
      <Button onPress={onOpen} color="primary" className="font-semibold shadow-md">
        + Add Medicine
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="2xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Add New Medicine</ModalHeader>
              <ModalBody className="gap-4">
                
                <div className="flex gap-4">
                  <Input 
                    label="Medicine Name" 
                    placeholder="e.g. Lisinopril" 
                    value={name} 
                    onValueChange={setName} 
                    isRequired 
                    className="flex-1"
                  />
                  <Input 
                    label="Dosage" 
                    placeholder="e.g. 10mg" 
                    value={dosage} 
                    onValueChange={setDosage} 
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
                    onValueChange={(v) => setPillsPerDose(parseInt(v) || 1)}
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
                    onValueChange={(v) => setPillsRemaining(parseInt(v) || 0)}
                    className="flex-1"
                  />
                  <Input 
                    type="number"
                    label="Low Stock Alert Threshold" 
                    min={0}
                    value={lowStockThreshold.toString()} 
                    onValueChange={(v) => setLowStockThreshold(parseInt(v) || 0)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Switch isSelected={isOngoing} onValueChange={setIsOngoing}>
                    Ongoing Prescription
                  </Switch>
                  {!isOngoing && (
                    <Input
                      type="date"
                      label="End Date"
                      value={endDate}
                      onValueChange={setEndDate}
                      className="flex-1"
                    />
                  )}
                </div>

                <Textarea 
                  label="Instructions / Notes" 
                  placeholder="e.g. Take with food"
                  value={notes}
                  onValueChange={setNotes}
                />

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                  Add Medicine
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
