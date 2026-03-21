import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Engine</h1>
      <p className="text-[var(--muted-foreground)]">
        Multi-tenant analytics platform for dashboards, data pipelines, and embeddable widgets.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Create and manage analytics dashboards with customizable widgets.
            </p>
            <Link href="/dashboards">
              <Button>View Dashboards</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Connect to external data sources and manage sync configurations.
            </p>
            <Link href="/data-sources">
              <Button>View Sources</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Build data processing pipelines with state machine management.
            </p>
            <Link href="/pipelines">
              <Button>View Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
