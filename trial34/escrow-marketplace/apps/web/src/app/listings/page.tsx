import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { truncate, formatCurrency } from '@escrow-marketplace/shared';
import { fetchListings } from '../../../../actions/listing-actions';

// TRACED: EM-CQ-TRUNC-003 — truncate used in listings page
export default async function ListingsPage() {
  const listings = await fetchListings();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((l: { id: string; title: string; description: string; price: number; status: string }) => (
          <Card key={l.id}>
            <CardHeader><CardTitle>{l.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{truncate(l.description, 80)}</p>
              <p className="font-semibold mb-2">{formatCurrency(l.price)}</p>
              <Badge variant={l.status === 'ACTIVE' ? 'default' : 'secondary'}>{l.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
