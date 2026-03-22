import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: string;
  status: string;
}

// TRACED: EM-FE-007 — No raw select elements in pages
export default async function ListingsPage() {
  let listings: ListingItem[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/listings?page=1&pageSize=20`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      listings = data.data || [];
    }
  } catch {
    listings = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Listings</h1>

      {listings.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No listings available at this time.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <Badge>{listing.status}</Badge>
              </div>
              <p className="text-gray-600 mb-4">{listing.description}</p>
              <p className="text-xl font-bold">
                {formatCurrency(listing.price)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
