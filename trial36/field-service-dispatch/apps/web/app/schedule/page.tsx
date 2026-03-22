// Schedule page
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

export default function SchedulePage() {
  const schedules = [
    { id: 'sched_1', technician: 'Alice Johnson', workOrder: 'HVAC Repair - Building A', date: '2026-03-22', time: '09:00 AM', status: 'CONFIRMED' },
    { id: 'sched_2', technician: 'Bob Smith', workOrder: 'Plumbing Install - Suite 200', date: '2026-03-22', time: '02:00 PM', status: 'PENDING' },
    { id: 'sched_3', technician: 'Carol Davis', workOrder: 'Electrical Inspection', date: '2026-03-23', time: '10:00 AM', status: 'CONFIRMED' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((sched) => (
                <TableRow key={sched.id}>
                  <TableCell className="font-medium">{sched.technician}</TableCell>
                  <TableCell>{sched.workOrder}</TableCell>
                  <TableCell>{sched.date}</TableCell>
                  <TableCell>{sched.time}</TableCell>
                  <TableCell>
                    <Badge variant={sched.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                      {sched.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
