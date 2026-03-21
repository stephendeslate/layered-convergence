import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function PipelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pipelines</h1>
      <Card>
        <CardHeader>
          <CardTitle>ETL Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sales ETL Pipeline</TableCell>
                <TableCell>Hourly</TableCell>
                <TableCell><Badge>Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marketing Data Sync</TableCell>
                <TableCell>Every 6 hours</TableCell>
                <TableCell><Badge variant="secondary">Paused</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
