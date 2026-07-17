'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { fetchClient } from '@/lib/api';
import { format, parseISO, subDays } from 'date-fns';

interface AggregationData {
  _id: string; // YYYY-MM-DD
  taken: number;
  skipped: number;
  missed: number;
  pending: number;
  total: number;
}

interface DoseHistoryItem {
  _id: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'missed' | 'pending';
  medicineId: {
    name: string;
    dosage: string;
  };
}

type RangeOption = 7 | 30 | 90;

export default function AdherenceDashboard() {
  const [range, setRange] = useState<RangeOption>(30);
  const [aggregation, setAggregation] = useState<AggregationData[]>([]);
  const [history, setHistory] = useState<DoseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalLogged, setTotalLogged] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, range);
        
        const qParams = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

        // Fetch Aggregation
        const aggRes = await fetchClient(`/doses/adherence${qParams}`);
        if (aggRes.success) {
          const sortedAgg = (aggRes.data as AggregationData[]).sort((a, b) => a._id.localeCompare(b._id));
          setAggregation(sortedAgg);
          calculateStats(sortedAgg);
        }

        // Fetch Detail History
        const histRes = await fetchClient(`/doses/history${qParams}`);
        if (histRes.success) {
          setHistory(histRes.data);
        }

      } catch (error) {
        console.error('Error fetching adherence data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const calculateStats = (data: AggregationData[]) => {
    let takenCount = 0;
    let resolvableTotal = 0;
    let streak = 0;
    let streakBroken = false;

    // Calculate overall stats
    data.forEach(day => {
      takenCount += day.taken;
      resolvableTotal += (day.total - day.pending);
    });

    const rate = resolvableTotal === 0 ? 0 : Math.round((takenCount / resolvableTotal) * 100);
    setAdherenceRate(rate);
    setTotalLogged(resolvableTotal);

    // Calculate streak (going backwards from most recent day)
    const reversedData = [...data].reverse();
    for (const day of reversedData) {
      const dayResolvable = day.total - day.pending;
      if (dayResolvable > 0) {
        if (day.taken === dayResolvable) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      // If dayResolvable === 0, we just skip it, doesn't break or increment streak
    }
    setCurrentStreak(streak);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'success';
      case 'skipped': return 'warning';
      case 'missed': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Date Range Selector */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-max">
        {[7, 30, 90].map(r => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? 'solid' : 'light'}
            color={range === r ? 'primary' : 'default'}
            onPress={() => setRange(r as RangeOption)}
            className="font-medium"
          >
            Last {r} Days
          </Button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-sm font-medium">Adherence Rate</p>
            <p className="text-3xl font-bold text-primary mt-2">{adherenceRate}%</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-sm font-medium">Current Streak</p>
            <p className="text-3xl font-bold text-success mt-2">{currentStreak} days</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-sm font-medium">Total Doses Logged</p>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-2">{totalLogged}</p>
          </CardBody>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6">
            Adherence Chart
          </h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div>
          ) : aggregation.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">No data available for this range.</div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="taken" name="Taken" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="skipped" name="Skipped" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* History List */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Detailed Log
          </h3>
          {isLoading ? (
            <p className="text-slate-400">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-400">No dose logs found for this period.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((log) => (
                <div key={log._id} className="flex flex-row items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {log.medicineId.name} <span className="text-slate-400 text-sm font-normal ml-1">({log.medicineId.dosage})</span>
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {format(parseISO(log.scheduledTime), 'MMM d, yyyy \u2022 h:mm a')}
                    </span>
                  </div>
                  <Chip 
                    size="sm" 
                    color={getStatusColor(log.status)} 
                    variant="flat"
                    className="capitalize"
                  >
                    {log.status}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
