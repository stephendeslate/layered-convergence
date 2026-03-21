// TRACED: AE-UI-RPT-001 — Reports page
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatBytes } from '@analytics-engine/shared';

export default function ReportsPage() {
  const reports = [
    { id: '1', name: 'Monthly Revenue', generatedAt: '2026-03-01', size: formatBytes(524288), status: 'READY' },
    { id: '2', name: 'User Engagement Q1', generatedAt: '2026-03-15', size: formatBytes(1048576), status: 'READY' },
    { id: '3', name: 'Pipeline Health', generatedAt: '2026-03-20', size: formatBytes(262144), status: 'GENERATING' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-lg">{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">Generated: {report.generatedAt}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{report.size}</Badge>
                <Badge variant={report.status === 'READY' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
