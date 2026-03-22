// TRACED: EM-FE-007 — Listings page with server actions
import { fetchListings } from '@/lib/api';
import { formatCurrency, truncateText } from '@escrow-marketplace/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ListingsPage() {
  const listings = await fetchListings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Listings</h1>
      </div>

      {listings.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No listings found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: { id: string; title: string; description: string; price: string; status: string }) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {truncateText(listing.title, 40)}
                  </CardTitle>
                  <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {listing.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {truncateText(listing.description, 120)}
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatCurrency(listing.price)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
