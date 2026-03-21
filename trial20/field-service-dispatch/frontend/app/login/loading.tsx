import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-busy="true">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
