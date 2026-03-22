import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <Button>Create Dashboard</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Executive Overview</CardTitle>
            <CardDescription>High-level KPIs for leadership</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>Public</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Engineering Metrics</CardTitle>
            <CardDescription>CI/CD and deployment tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Private</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
