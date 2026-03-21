import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DataSourcesLoading() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="h-9 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
