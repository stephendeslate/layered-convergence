import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/30 animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-0">
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
