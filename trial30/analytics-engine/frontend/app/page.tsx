import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Analytics Engine</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Multi-tenant analytics platform for data-driven organizations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage analytics dashboards with configurable widgets.</p>
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
            <p className="mb-4">Configure ETL pipelines to process data from multiple sources.</p>
            <Link href="/pipelines">
              <Button variant="outline">Manage Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
