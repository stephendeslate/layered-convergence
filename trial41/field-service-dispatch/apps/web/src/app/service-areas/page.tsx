import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function ServiceAreasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Areas</h1>
        <Button>Add Service Area</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Zip Codes</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Manhattan</TableCell>
            <TableCell>10001, 10002, 10003</TableCell>
            <TableCell>15 mi</TableCell>
            <TableCell><Badge>Active</Badge></TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Brooklyn</TableCell>
            <TableCell>11201, 11202</TableCell>
            <TableCell>10 mi</TableCell>
            <TableCell><Badge variant="destructive">Inactive</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
