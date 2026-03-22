import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <Button>Add Data Source</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Production Database</CardTitle>
            <CardDescription>Main PostgreSQL production database</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Badge>DATABASE</Badge>
            <Badge variant="secondary">Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deprecated API Feed</CardTitle>
            <CardDescription>Legacy API — scheduled for removal</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Badge variant="outline">API</Badge>
            <Badge variant="destructive">Inactive</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
