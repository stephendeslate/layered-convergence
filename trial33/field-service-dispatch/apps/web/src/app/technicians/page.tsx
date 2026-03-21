import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { AVAILABILITY_STATUSES } from '@field-service-dispatch/shared';

// TRACED: FD-REQ-TECH-001 — Technicians page using shared constants
export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <Card>
        <CardHeader>
          <CardTitle>Availability Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {AVAILABILITY_STATUSES.map((s) => (
              <Badge key={s} variant={s === 'AVAILABLE' ? 'default' : 'outline'}>
                {s}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span>John Smith — plumbing, electrical, hvac</span>
              <Badge>AVAILABLE</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
