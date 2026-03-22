// TRACED: FD-UI-TECH-001 — Technicians page
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCoordinates } from '@field-service-dispatch/shared';

export default function TechniciansPage() {
  const technicians = [
    { id: 'tech_1', name: 'Alice Johnson', status: 'AVAILABLE', lat: '40.7128', lng: '-74.0060' },
    { id: 'tech_2', name: 'Bob Smith', status: 'BUSY', lat: '34.0522', lng: '-118.2437' },
    { id: 'tech_3', name: 'Carol Davis', status: 'OFF_DUTY', lat: '41.8781', lng: '-87.6298' },
    { id: 'tech_4', name: 'Dan Wilson', status: 'INACTIVE', lat: '29.7604', lng: '-95.3698' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => (
          <Card key={tech.id}>
            <CardHeader>
              <CardTitle>{tech.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className="mb-2"
                variant={tech.status === 'AVAILABLE' ? 'default' : tech.status === 'BUSY' ? 'destructive' : 'secondary'}
              >
                {tech.status}
              </Badge>
              <p className="text-sm text-[var(--muted-foreground)]">
                {formatCoordinates(tech.lat, tech.lng)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
