// TRACED: UI-HOME-001 — Home page component
// TRACED: FD-UI-HOME-001 — Home page with truncateText and formatCoordinates usage
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatBytes, formatCoordinates, truncateText } from '@field-service-dispatch/shared';

export default function HomePage() {
  const stats = [
    { label: 'Active Work Orders', value: '342', trend: '+12%' },
    { label: 'Technicians On Duty', value: '28', trend: '+3%' },
    { label: 'Log Storage Used', value: formatBytes(5368709120), trend: '+18%' },
    { label: 'HQ Location', value: formatCoordinates('40.7128', '-74.0060'), trend: 'NYC' },
  ];

  const recentDescription = truncateText(
    'Central AC unit not cooling properly in the main building lobby area',
    40,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Field Service Dispatch</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Multi-tenant field service management and technician dispatch platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge variant="secondary" className="mt-1">{stat.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            Latest Work Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{recentDescription}</p>
        </CardContent>
      </Card>
    </div>
  );
}
