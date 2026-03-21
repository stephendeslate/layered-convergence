import { Card, CardContent } from '@/components/ui/card';

export default function WorkOrdersLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            <div className="h-12 w-full animate-pulse border-b bg-muted/50" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse border-b bg-muted/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
