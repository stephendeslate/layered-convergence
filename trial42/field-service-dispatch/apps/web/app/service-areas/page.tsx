import dynamic from 'next/dynamic';
import { fetchServiceAreas } from '../actions';
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

interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
  radius: number;
  active: boolean;
}

export default async function ServiceAreasPage() {
  let serviceAreas: { data: ServiceArea[] } = { data: [] };
  try {
    serviceAreas = await fetchServiceAreas();
  } catch {
    // Will show empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service Areas</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>ZIP Codes</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceAreas.data.map((area) => (
            <TableRow key={area.id}>
              <TableCell>{area.name}</TableCell>
              <TableCell>{area.zipCodes.join(', ')}</TableCell>
              <TableCell>{area.radius} mi</TableCell>
              <TableCell>
                <Badge variant={area.active ? 'default' : 'secondary'}>
                  {area.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
