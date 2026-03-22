// TRACED: FD-UI-SCHED-002 — ScheduleStats loaded via next/dynamic for bundle optimization
'use client';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ScheduleStatsProps {
  totalScheduled: number;
  pendingAssignment: number;
  completedToday: number;
}

export function ScheduleStats({
  totalScheduled,
  pendingAssignment,
  completedToday,
}: ScheduleStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[var(--muted-foreground)]">
            Total Scheduled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {totalScheduled}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[var(--muted-foreground)]">
            Pending Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {pendingAssignment}
            </span>
            {pendingAssignment > 0 && (
              <Badge variant="destructive">Needs Action</Badge>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[var(--muted-foreground)]">
            Completed Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {completedToday}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
