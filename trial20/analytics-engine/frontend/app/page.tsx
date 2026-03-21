import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Engine</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Multi-tenant analytics platform for data visualization and pipeline management.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Create and manage dashboards with widgets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboards">
              <Button className="w-full">View Dashboards</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Connect and configure data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data-sources">
              <Button className="w-full">View Sources</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
            <CardDescription>Manage data processing pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pipelines">
              <Button className="w-full">View Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
