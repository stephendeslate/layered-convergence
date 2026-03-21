import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RoutesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Routes</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>East Portland AM Route</TableCell>
                <TableCell>Jake Morrison</TableCell>
                <TableCell><Badge>ACTIVE</Badge></TableCell>
                <TableCell>Mar 25, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Downtown PM Route</TableCell>
                <TableCell>Maria Chen</TableCell>
                <TableCell><Badge variant="outline">PLANNED</Badge></TableCell>
                <TableCell>Mar 25, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>West Side Full Day</TableCell>
                <TableCell>Sam Rodriguez</TableCell>
                <TableCell><Badge variant="secondary">COMPLETED</Badge></TableCell>
                <TableCell>Mar 20, 2026</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
