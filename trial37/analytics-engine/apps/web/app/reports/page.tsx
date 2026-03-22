// TRACED: AE-FE-08
import { slugify } from '@analytics-engine/shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

interface Report {
  id: string;
  title: string;
  description: string | null;
  format: string;
  createdAt: string;
}

const placeholderReports: Report[] = [
  {
    id: '1',
    title: 'Q1 Revenue Summary',
    description: 'First quarter revenue analysis with breakdowns by region.',
    format: 'PDF',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Monthly Active Users',
    description: 'User engagement metrics for March 2026.',
    format: 'CSV',
    createdAt: '2026-03-10T08:00:00Z',
  },
];

export default function ReportsPage() {
  const reports = placeholderReports;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View and download generated reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => {
          const downloadSlug = slugify(report.title);

          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <Badge variant="outline">{report.format}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.description ?? 'No description'}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Generated: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/reports/${downloadSlug}.${report.format.toLowerCase()}`}>
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
