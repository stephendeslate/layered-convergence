import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Multi-tenant analytics platform for data-driven insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Create and manage analytics dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
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
              <Button className="w-full" variant="outline">Manage Sources</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
            <CardDescription>Build data processing pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pipelines">
              <Button className="w-full" variant="outline">View Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    </div>
  );
}
