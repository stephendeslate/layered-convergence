// TRACED:AE-HOME-PAGE
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

const StatsSection = dynamic(() => import('./stats-section'), { ssr: false });

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Analytics Engine</h1>
        <p className="mt-2 text-gray-500">
          Monitor your data pipelines, track events, and build dashboards.
        </p>
      </div>

      <StatsSection />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events</CardTitle>
            <CardDescription>Track and monitor analytics events</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button variant="outline" className="w-full">View Events</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dashboards</CardTitle>
            <CardDescription>Build custom analytics dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">View Dashboards</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
            <CardDescription>Manage your data connections</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data-sources">
              <Button variant="outline" className="w-full">View Sources</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipelines</CardTitle>
            <CardDescription>Configure data processing pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pipelines">
              <Button variant="outline" className="w-full">View Pipelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
