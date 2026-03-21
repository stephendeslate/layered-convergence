import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// [TRACED:FE-011] Dashboard page
export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Overview
              <Badge>Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Welcome to your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
