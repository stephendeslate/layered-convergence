// TRACED: FD-UI-TECH-001 — Technicians list page with table, status badges, GPS coordinates
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatCoordinates } from '@field-service-dispatch/shared';
import type { TechnicianStatus } from '@field-service-dispatch/shared';

const statusVariant: Record<TechnicianStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  BUSY: 'secondary',
  OFF_DUTY: 'outline',
  INACTIVE: 'destructive',
};

const mockTechnicians = [
  {
    id: 'tech-001',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    specialty: 'HVAC',
    status: 'AVAILABLE' as TechnicianStatus,
    latitude: '40.7580',
    longitude: '-73.9855',
    activeOrders: 2,
  },
  {
    id: 'tech-002',
    name: 'James Chen',
    email: 'james.chen@example.com',
    specialty: 'Electrical',
    status: 'BUSY' as TechnicianStatus,
    latitude: '40.7484',
    longitude: '-73.9857',
    activeOrders: 3,
  },
  {
    id: 'tech-003',
    name: 'Sarah Okafor',
    email: 'sarah.okafor@example.com',
    specialty: 'Plumbing',
    status: 'OFF_DUTY' as TechnicianStatus,
    latitude: '40.7527',
    longitude: '-73.9772',
    activeOrders: 0,
  },
  {
    id: 'tech-004',
    name: 'Tom Rivera',
    email: 'tom.rivera@example.com',
    specialty: 'General',
    status: 'INACTIVE' as TechnicianStatus,
    latitude: '40.7614',
    longitude: '-73.9776',
    activeOrders: 0,
  },
];

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Technicians</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            View and manage field service technicians and their assignments.
          </p>
        </div>
        <Badge variant="secondary">{mockTechnicians.length} total</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            All Technicians
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Active Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTechnicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{tech.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{tech.specialty}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[tech.status]}>
                      {tech.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatCoordinates(tech.latitude, tech.longitude)}
                  </TableCell>
                  <TableCell>{tech.activeOrders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
