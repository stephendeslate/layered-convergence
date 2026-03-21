import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardsLoading() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="h-9 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
