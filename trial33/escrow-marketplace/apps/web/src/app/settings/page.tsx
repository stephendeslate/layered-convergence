import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

// TRACED: EM-REQ-AUD-001 — Settings page with form controls
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marketplace-name">Marketplace Name</Label>
            <Input id="marketplace-name" placeholder="Enter marketplace name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-percent">Platform Fee (%)</Label>
            <Input id="fee-percent" type="number" placeholder="2.5" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
