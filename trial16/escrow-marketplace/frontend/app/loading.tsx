import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function RootLoading() {
  return (
    <div className="space-y-8">
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
