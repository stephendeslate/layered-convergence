'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// TRACED:AE-PERF-005
const DashboardOverview = dynamic(
  () => import('@/components/ui/card').then((mod) => {
    function DashboardOverviewContent() {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <mod.Card>
            <mod.CardHeader>
              <mod.CardTitle>Total Events</mod.CardTitle>
              <mod.CardDescription>Across all sources</mod.CardDescription>
            </mod.CardHeader>
            <mod.CardContent>
              <p className="text-2xl font-bold">--</p>
            </mod.CardContent>
          </mod.Card>
          <mod.Card>
            <mod.CardHeader>
              <mod.CardTitle>Active Pipelines</mod.CardTitle>
              <mod.CardDescription>Currently running</mod.CardDescription>
            </mod.CardHeader>
            <mod.CardContent>
              <p className="text-2xl font-bold">--</p>
            </mod.CardContent>
          </mod.Card>
          <mod.Card>
            <mod.CardHeader>
              <mod.CardTitle>Data Sources</mod.CardTitle>
              <mod.CardDescription>Connected sources</mod.CardDescription>
            </mod.CardHeader>
            <mod.CardContent>
              <p className="text-2xl font-bold">--</p>
            </mod.CardContent>
          </mod.Card>
          <mod.Card>
            <mod.CardHeader>
              <mod.CardTitle>Dashboards</mod.CardTitle>
              <mod.CardDescription>Created dashboards</mod.CardDescription>
            </mod.CardHeader>
            <mod.CardContent>
              <p className="text-2xl font-bold">--</p>
            </mod.CardContent>
          </mod.Card>
        </div>
      );
    }
    return DashboardOverviewContent;
  }),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Welcome to Analytics Engine. Monitor your data pipelines and events.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
