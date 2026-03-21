import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WidgetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Widgets</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Chart</CardTitle>
            <Badge variant="outline">bar-chart</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">Displays monthly revenue trends</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
