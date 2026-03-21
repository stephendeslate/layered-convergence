import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { TRANSACTION_STATUSES, LISTING_STATUSES } from '@escrow-marketplace/shared';

// TRACED: EM-FC-NEXT-001 — Next.js home page with shared imports
export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Escrow Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Listings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Statuses: {LISTING_STATUSES.join(', ')}</p>
            <Button asChild><a href="/listings">Browse Listings</a></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Statuses: {TRANSACTION_STATUSES.slice(0, 4).join(', ')}</p>
            <Button asChild><a href="/transactions">View Transactions</a></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Disputes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Resolve disputed transactions securely.</p>
            <Button asChild><a href="/disputes">Manage Disputes</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
