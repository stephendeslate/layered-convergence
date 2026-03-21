import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { formatDate } from '@escrow-marketplace/shared';

// TRACED: EM-REQ-MT-001 — Home page with shared formatDate
export default function HomePage() {
  const today = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Escrow Marketplace</h1>
      <p className="text-muted-foreground">Today is {today}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Escrow</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage escrow transactions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View transaction history and status.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage and resolve payment disputes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
