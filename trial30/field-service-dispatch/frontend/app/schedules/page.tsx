import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function SchedulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Technician Schedules</h1>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>tech1@example.com</TableCell>
                <TableCell>Monday</TableCell>
                <TableCell>08:00</TableCell>
                <TableCell>17:00</TableCell>
                <TableCell><Badge>Available</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>tech1@example.com</TableCell>
                <TableCell>Tuesday</TableCell>
                <TableCell>09:00</TableCell>
                <TableCell>18:00</TableCell>
                <TableCell><Badge>Available</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>tech2@example.com</TableCell>
                <TableCell>Monday</TableCell>
                <TableCell>07:00</TableCell>
                <TableCell>16:00</TableCell>
                <TableCell><Badge variant="secondary">On Call</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
