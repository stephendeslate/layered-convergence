// TRACED: FD-TECH-001 — Technicians list page with status indicators
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  BUSY: 'secondary',
  OFF_DUTY: 'outline',
  INACTIVE: 'destructive',
};

interface Technician {
  id: string;
  name: string;
  specialty: string | null;
  status: string;
  latitude: string;
  longitude: string;
}

export default function TechniciansPage() {
  const technicians: Technician[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
        <p className="text-[var(--muted-foreground)]">
          View and manage field technicians.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                No technicians found. Connect to the API to load data.
              </TableCell>
            </TableRow>
          ) : (
            technicians.map((tech) => (
              <TableRow key={tech.id}>
                <TableCell className="font-medium">{tech.name}</TableCell>
                <TableCell>{tech.specialty ?? 'General'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[tech.status] ?? 'outline'}>
                    {tech.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {tech.latitude}, {tech.longitude}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
