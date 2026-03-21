import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Analytics Engine</h1>
      <p className="text-lg text-[var(--muted-foreground)]">Multi-tenant analytics platform for data-driven insights.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
            <CardDescription>Manage data processing workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pipelines"><Button>View Pipelines</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Configure external data connections</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data-sources"><Button>View Sources</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Visualize your analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard"><Button>View Dashboards</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
