import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="h-7 w-20 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
        </CardContent>
      </Card>
      <span className="sr-only">Loading login form...</span>
    </div>
  );
}
