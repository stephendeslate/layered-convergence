import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Technicians</h1>
        <Button>Add Technician</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Specialties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Smith</TableCell>
            <TableCell>john@fieldservice.com</TableCell>
            <TableCell><Badge variant="secondary">Available</Badge></TableCell>
            <TableCell>Electrical, Plumbing</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Doe</TableCell>
            <TableCell>jane@fieldservice.com</TableCell>
            <TableCell><Badge>On Assignment</Badge></TableCell>
            <TableCell>HVAC, Electrical</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
