import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
            <Badge variant="default">In Progress</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">8</p>
            <Badge variant="secondary">Ready</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5</p>
            <Badge variant="outline">Upcoming</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
