import { Card, CardContent } from '@/components/ui/card';

export default function RoutesLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <div className="h-9 w-28 animate-pulse rounded bg-muted" />
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            <div className="h-12 w-full animate-pulse border-b bg-muted/50" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse border-b bg-muted/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
