import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ROUTES = [
  { id: 'r-1', name: 'North District Morning Route', status: 'ACTIVE', date: '2026-03-22', technician: 'Alex Rivera' },
];

function statusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'default' as const;
    case 'ACTIVE': return 'secondary' as const;
    default: return 'outline' as const;
  }
}

export default function RoutesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROUTES.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(route.status)}>{route.status}</Badge>
                  </TableCell>
                  <TableCell>{route.date}</TableCell>
                  <TableCell>{route.technician}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
