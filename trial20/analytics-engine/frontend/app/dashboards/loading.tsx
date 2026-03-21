import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-10 w-36 animate-pulse rounded bg-[var(--muted)]" />
      </div>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-[var(--muted)]" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading dashboards...</span>
    </div>
  );
}
