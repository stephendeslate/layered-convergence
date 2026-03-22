import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Button>Create Pipeline</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Data Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">ETL Daily Sync</TableCell>
            <TableCell><Badge>Active</Badge></TableCell>
            <TableCell>$25.00</TableCell>
            <TableCell>Production Database</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Legacy Import</TableCell>
            <TableCell><Badge variant="destructive">Error</Badge></TableCell>
            <TableCell>$0.00</TableCell>
            <TableCell>Deprecated API Feed</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Paused Aggregation</TableCell>
            <TableCell><Badge variant="secondary">Paused</Badge></TableCell>
            <TableCell>$10.00</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
