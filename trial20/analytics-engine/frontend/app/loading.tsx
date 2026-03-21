import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-[var(--muted)]" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
