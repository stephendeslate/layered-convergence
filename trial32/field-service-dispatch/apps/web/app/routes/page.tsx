import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { fetchRoutes } from '@/app/actions';

export default async function RoutesPage() {
  let routes: Awaited<ReturnType<typeof fetchRoutes>> = [];

  try {
    routes = await fetchRoutes();
  } catch {
    routes = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Routes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Technician</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>{route.date}</TableCell>
              <TableCell>{route.technicianId}</TableCell>
            </TableRow>
          ))}
          {routes.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No routes found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
