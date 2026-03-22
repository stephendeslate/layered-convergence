// TRACED: FD-PERF-008 — Dynamic import for bundle optimization
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleStatsProps {
  totalSchedules: number;
  todaySchedules: number;
  upcomingSchedules: number;
}

export function ScheduleStats({
  totalSchedules,
  todaySchedules,
  upcomingSchedules,
}: ScheduleStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalSchedules}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{todaySchedules}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{upcomingSchedules}</p>
        </CardContent>
      </Card>
    </div>
  );
}
