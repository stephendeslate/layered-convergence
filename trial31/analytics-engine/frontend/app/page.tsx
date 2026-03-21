import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Analytics Engine</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Multi-tenant analytics platform for data-driven decisions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage your analytics dashboards.</p>
            <Link href="/dashboard">
              <Button>View Dashboards</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Configure and monitor data pipelines.</p>
            <Link href="/pipelines">
              <Button variant="outline">View Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
