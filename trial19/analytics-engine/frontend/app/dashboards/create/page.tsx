import { createDashboard } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateDashboardPage() {
  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDashboard} aria-label="Create dashboard form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard name</Label>
              <Input id="name" name="name" type="text" required aria-label="Dashboard name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" type="text" aria-label="Description" />
            </div>
            <Button type="submit" aria-label="Create dashboard">
              Create Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
