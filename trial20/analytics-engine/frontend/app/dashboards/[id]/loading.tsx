import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardDetailLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <Card>
        <CardHeader>
          <div className="h-6 w-24 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
