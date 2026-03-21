import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TechniciansLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded bg-muted" />
      </div>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
