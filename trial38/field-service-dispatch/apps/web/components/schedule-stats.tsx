// TRACED: FD-UI-SCHED-003 — Schedule stats component (dynamically imported for L7 bundle optimization)
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface ScheduleStatsProps {
  upcoming: number;
  today: number;
  completed: number;
  missed: number;
}

export default function ScheduleStats({ upcoming, today, completed, missed }: ScheduleStatsProps) {
  const items = [
    { label: 'Upcoming', value: upcoming, color: 'text-[var(--foreground)]' },
    { label: 'Today', value: today, color: 'text-[var(--primary)]' },
    { label: 'Completed', value: completed, color: 'text-[var(--muted-foreground)]' },
    { label: 'Missed', value: missed, color: 'text-[var(--destructive)]' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
