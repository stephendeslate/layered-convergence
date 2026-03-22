// TRACED:AE-FE-06 — Reports page with server action data fetching

import { fetchReports } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sanitizeInput } from '@analytics-engine/shared';

export default async function ReportsPage() {
  const reports = await fetchReports();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports generated yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report: { id: string; title: string; format: string; content?: string; createdAt: string }) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {sanitizeInput(report.title)}
                  </CardTitle>
                  <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.content
                    ? sanitizeInput(report.content)
                    : 'No content preview available.'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Generated: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
