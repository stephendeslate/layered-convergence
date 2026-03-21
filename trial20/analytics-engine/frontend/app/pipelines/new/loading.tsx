import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function NewPipelineLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="h-7 w-32 animate-pulse rounded bg-[var(--muted)]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-10 w-full animate-pulse rounded bg-[var(--muted)]" />
        </CardContent>
      </Card>
      <span className="sr-only">Loading form...</span>
    </div>
  );
}
