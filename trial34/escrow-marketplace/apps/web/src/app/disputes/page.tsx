import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

export default function DisputesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Disputes</h1>
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Active Disputes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Review and resolve transaction disputes.</p>
          <Button>View All Disputes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
