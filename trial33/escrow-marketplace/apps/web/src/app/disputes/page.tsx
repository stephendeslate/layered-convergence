import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';

// TRACED: EM-DM-DISP-001 — Disputes page
export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <Alert variant="destructive">
        <AlertTitle>Active Disputes</AlertTitle>
        <AlertDescription>There are 2 disputes requiring attention.</AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Recent Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Deliverable does not match specification</span>
              <Badge variant="destructive">UNDER_REVIEW</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Buyer unresponsive for 14 days</span>
              <Badge variant="destructive">ESCALATED</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
