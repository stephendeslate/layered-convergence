// TRACED: FD-UI-MAP-001 — Map page with coordinate display
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatCoordinates } from '@field-service-dispatch/shared';

export default function MapPage() {
  const locations = [
    { id: 'tech_1', name: 'Alice Johnson', status: 'AVAILABLE', lat: '40.7128', lng: '-74.0060' },
    { id: 'tech_2', name: 'Bob Smith', status: 'BUSY', lat: '34.0522', lng: '-118.2437' },
    { id: 'tech_3', name: 'Carol Davis', status: 'OFF_DUTY', lat: '41.8781', lng: '-87.6298' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technician Map</h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
                <div>
                  <p className="font-medium">{loc.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {formatCoordinates(loc.lat, loc.lng)}
                  </p>
                </div>
                <Badge
                  variant={loc.status === 'AVAILABLE' ? 'default' : loc.status === 'BUSY' ? 'destructive' : 'secondary'}
                >
                  {loc.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
