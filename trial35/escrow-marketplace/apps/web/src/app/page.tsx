// TRACED: EM-UI-HOME-001 — Home page with formatBytes usage
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { formatBytes, formatCurrency } from '@escrow-marketplace/shared';

export default function HomePage() {
  const stats = [
    { label: 'Active Listings', value: '1,247', trend: '+15%' },
    { label: 'Escrow Volume', value: formatCurrency(2450000), trend: '+22%' },
    { label: 'Documents Stored', value: formatBytes(10737418240), trend: '+8%' },
    { label: 'Disputes Open', value: '12', trend: '-5%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Escrow Marketplace</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Secure multi-tenant escrow platform for marketplace transactions.
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
    </div>
  );
}
