import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@analytics-engine/shared';

// TRACED: AE-ARCH-002
// TRACED: AE-FE-007
export default function HomePage() {
  const features = [
    {
      title: 'Dashboards',
      description: 'Create and manage interactive dashboards with real-time data visualizations.',
      href: '/dashboards',
      status: 'Available',
    },
    {
      title: 'Pipelines',
      description: 'Configure and monitor data pipelines with scheduling and error tracking.',
      href: '/pipelines',
      status: 'Available',
    },
    {
      title: 'Reports',
      description: 'Generate, publish, and archive analytical reports across your organization.',
      href: '/reports',
      status: 'Available',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Analytics Engine
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
          A comprehensive platform for data analytics, pipeline management, and reporting.
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Processing capacity: {formatBytes(1073741824)} per pipeline run
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href} style={{ textDecoration: 'none' }}>
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{feature.title}</h2>
                  <Badge>{feature.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
