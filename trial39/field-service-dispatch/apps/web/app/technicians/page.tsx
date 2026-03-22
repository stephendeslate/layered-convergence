// TRACED: FD-UI-TECH-001 — Technicians list page with status indicators
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
    specialty: 'HVAC',
    status: 'AVAILABLE' as TechnicianStatus,
    location: { lat: '40.7580000', lng: '-73.9855000' },
    activeJobs: 0,
  },
  {
    id: 'tech-002',
    name: 'James Chen',
    specialty: 'Electrical',
    status: 'BUSY' as TechnicianStatus,
    location: { lat: '40.7484000', lng: '-73.9857000' },
    activeJobs: 2,
  },
  {
    id: 'tech-003',
    name: 'Sarah Okafor',
    specialty: 'Plumbing',
    status: 'INACTIVE' as TechnicianStatus,
    location: { lat: '40.7527000', lng: '-73.9772000' },
    activeJobs: 0,
  },
  {
    id: 'tech-004',
    name: 'Tom Rivera',
    specialty: 'General Maintenance',
    status: 'OFF_DUTY' as TechnicianStatus,
    location: { lat: '40.7614000', lng: '-73.9776000' },
    activeJobs: 0,
  },
];

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Technicians</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manage field service technicians and their availability.
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Active Jobs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTechnicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-mono text-xs">{tech.id}</TableCell>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell>{tech.specialty}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[tech.status]}>{tech.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatCoordinates(tech.location.lat, tech.location.lng)}
                  </TableCell>
                  <TableCell>{tech.activeJobs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
