import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="h-7 w-24 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading registration form...</span>
    </div>
  );
}
