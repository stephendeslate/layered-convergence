import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchTechnicians } from '@/app/actions';

export default async function TechniciansPage() {
  let technicians: Awaited<ReturnType<typeof fetchTechnicians>> = [];

  try {
    technicians = await fetchTechnicians();
  } catch {
    technicians = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technicians</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Availability</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((tech) => (
            <TableRow key={tech.id}>
              <TableCell className="font-medium">{tech.name}</TableCell>
              <TableCell>{tech.specialty}</TableCell>
              <TableCell>
                <Badge variant={tech.isAvailable ? 'default' : 'destructive'}>
                  {tech.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {technicians.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No technicians found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
