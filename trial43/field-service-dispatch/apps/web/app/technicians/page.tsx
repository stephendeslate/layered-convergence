import dynamic from 'next/dynamic';
import { fetchTechnicians } from '../actions';
import { Badge } from '@/components/ui/badge';

const Table = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.Table),
);
const TableHeader = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHeader),
);
const TableBody = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableBody),
);
const TableRow = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableRow),
);
const TableHead = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHead),
);
const TableCell = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableCell),
);

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  specialties: string[];
}

export default async function TechniciansPage() {
  let technicians: { data: Technician[] } = { data: [] };
  try {
    technicians = await fetchTechnicians();
  } catch {
    // Will show empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Technicians</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Specialties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.data.map((tech) => (
            <TableRow key={tech.id}>
              <TableCell>{tech.name}</TableCell>
              <TableCell>{tech.email}</TableCell>
              <TableCell>{tech.phone}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    tech.status === 'AVAILABLE' ? 'default' : 'secondary'
                  }
                >
                  {tech.status}
                </Badge>
              </TableCell>
              <TableCell>{tech.specialties.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
