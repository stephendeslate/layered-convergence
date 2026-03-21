import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';

export default function TechniciansPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Technicians</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              View and manage your field service technicians.
            </p>
            <Badge>Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              HVAC, Electrical, Plumbing, General Maintenance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
