import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const mockDataSources = [
  { id: '1', name: 'Production Database', type: 'DATABASE', cost: '$99.99' },
  { id: '2', name: 'External API', type: 'API', cost: '$49.99' },
  { id: '3', name: 'CSV Import', type: 'FILE', cost: '$0.00' },
  { id: '4', name: 'Kafka Stream', type: 'STREAM', cost: '$199.99' },
];

export default function DataSourcesPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connected Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monthly Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDataSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{source.type}</Badge>
                  </TableCell>
                  <TableCell>{source.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
