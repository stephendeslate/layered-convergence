import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Engine</h1>
      <p className="text-muted-foreground">Multi-tenant analytics platform for managing data sources, pipelines, and dashboards.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Create and manage your analytics dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboards">View Dashboards</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Connect and configure your data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/data-sources">View Data Sources</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
            <CardDescription>Build and manage your data pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pipelines">View Pipelines</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
