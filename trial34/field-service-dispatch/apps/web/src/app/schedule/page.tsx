import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Schedule</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage technician schedules and dispatch assignments.
            </p>
            <Button>Create Schedule</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Optimize technician routes for efficient field service coverage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
