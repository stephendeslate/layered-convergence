import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function EmbedsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded bg-[var(--muted)]" />
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
        </CardContent>
      </Card>
      <span className="sr-only">Loading embeds...</span>
    </div>
  );
}
