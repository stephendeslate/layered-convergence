// TRACED: EM-UI-LIST-001 — Listings page
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { formatCurrency } from '@escrow-marketplace/shared';

export default function ListingsPage() {
  const listings = [
    { id: '1', title: 'Premium Domain', price: '5000.00', status: 'ACTIVE' },
    { id: '2', title: 'SaaS Business', price: '25000.00', status: 'ACTIVE' },
    { id: '3', title: 'Design Assets', price: '150.00', status: 'SOLD' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listings</h1>
        <Button>Create Listing</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle>{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(listing.price)}</p>
              <Badge className="mt-2" variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {listing.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
