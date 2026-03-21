import { fetchRoutes } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function RoutesPage() {
  const routes = await fetchRoutes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Routes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Distance (mi)</TableHead>
            <TableHead>Stops</TableHead>
            <TableHead>Technician</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>{formatDate(route.date)}</TableCell>
              <TableCell>{route.distance.toFixed(1)}</TableCell>
              <TableCell>{route.stops}</TableCell>
              <TableCell>{route.technician?.name ?? 'N/A'}</TableCell>
            </TableRow>
          ))}
          {routes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No routes found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
