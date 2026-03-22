import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Multi-tenant data analytics platform for dashboards, pipelines, and reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage interactive data visualizations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure and monitor data processing pipelines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate and download analytics reports.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
