import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { PIPELINE_STATUSES } from '@analytics-engine/shared';

// TRACED: AE-REQ-PIPE-003 — Pipelines page using shared constants
export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipelines</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-muted-foreground">Schedule: 0 2 * * *</p>
            <div className="flex gap-2">
              {PIPELINE_STATUSES.map((s) => (
                <Badge key={s} variant={s === 'FAILED' ? 'destructive' : 'outline'}>
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
