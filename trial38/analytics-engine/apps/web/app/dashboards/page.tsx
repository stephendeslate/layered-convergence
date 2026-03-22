// TRACED: AE-FE-06
import dynamic from 'next/dynamic';
import { truncateText } from '@analytics-engine/shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

// Bundle optimization: dynamically import heavy chart placeholder
const DashboardStats = dynamic(() => import('../../components/dashboard-stats'), {
  loading: () => <div className="h-16 animate-pulse rounded bg-[var(--muted)]" />,
});

interface Dashboard {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

const placeholderDashboards: Dashboard[] = [
  {
    id: '1',
    title: 'Revenue Overview',
    slug: 'revenue-overview',
    description: 'Monthly revenue metrics, trends, and key performance indicators for the analytics platform across all segments and regions.',
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'User Engagement',
    slug: 'user-engagement',
    description: 'User activity tracking with session duration, page views, and retention metrics for the current quarter.',
    createdAt: '2026-03-19T14:00:00Z',
  },
];

export default function DashboardsPage() {
  const dashboards = placeholderDashboards;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your analytics dashboards.
        </p>
      </div>

      <DashboardStats count={dashboards.length} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                <Badge>{dashboard.slug}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dashboard.description
                  ? truncateText(dashboard.description, 80)
                  : 'No description'}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Created: {new Date(dashboard.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
