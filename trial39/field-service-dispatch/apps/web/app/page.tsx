// TRACED: FD-UI-HOME-001 — Dashboard home page with overview cards
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatBytes } from '@field-service-dispatch/shared';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Field service dispatch operations overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted-foreground)]">
              Open Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-[var(--muted-foreground)]">3 urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted-foreground)]">
              Active Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-[var(--muted-foreground)]">2 en route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted-foreground)]">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Avg response: 42 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted-foreground)]">
              System Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(1572864)}</div>
            <Badge variant="secondary">Healthy</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
