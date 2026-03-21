import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Marketplace Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input id="org-name" placeholder="Enter organization name" />
          </div>
          <div>
            <Label htmlFor="escrow-fee">Escrow Fee (%)</Label>
            <Input id="escrow-fee" type="number" placeholder="2.5" />
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
