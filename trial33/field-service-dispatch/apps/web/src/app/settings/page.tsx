import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

// TRACED: FD-REQ-AUD-001 — Settings page with form controls
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Service Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" placeholder="Enter company name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dispatch-radius">Dispatch Radius (miles)</Label>
            <Input id="dispatch-radius" type="number" placeholder="50" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
