import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-FE-012
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const statusColors: Record<string, string> = {
  DRAFT: 'gray',
  PUBLISHED: 'green',
  FAILED: 'red',
  ARCHIVED: 'blue',
};

async function getReports() {
  const response = await fetch(`${API_URL}/reports`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }
  return response.json();
}

export default async function ReportsPage() {
  let reports;
  try {
    const result = await getReports();
    reports = result.data ?? [];
  } catch {
    reports = [];
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reports</h1>
        <Badge>{reports.length} total (max {MAX_PAGE_SIZE})</Badge>
      </div>
      {reports.length === 0 ? (
        <Card>
          <CardContent>
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              No reports found. Generate your first report from available data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Reports</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report: { id: string; name: string; status: string; generatedAt: string | null; createdAt: string; errorMessage: string | null }) => (
                  <TableRow key={report.id}>
                    <TableCell style={{ fontWeight: 500 }}>{report.name}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: statusColors[report.status] ?? 'gray', color: 'white' }}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--muted-foreground)' }}>
                      {report.generatedAt
                        ? new Date(report.generatedAt).toLocaleDateString()
                        : 'Not yet'}
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
