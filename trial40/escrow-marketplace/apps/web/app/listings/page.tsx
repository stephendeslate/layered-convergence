// TRACED: EM-FE-005 — Listings page with Server Actions
import dynamic from 'next/dynamic';
import { fetchListings } from '../../lib/actions';
import { formatCurrency, truncateText } from '@escrow-marketplace/shared';

const ListingsTable = dynamic(() => import('./listings-table'), { ssr: false });

export default async function ListingsPage() {
  const listings = await fetchListings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Listings</h1>
      {listings.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No listings found.</p>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing: { id: string; title: string; description: string; price: string; status: string }) => (
            <div
              key={listing.id}
              className="rounded-lg border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h3 className="font-semibold">{listing.title}</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {truncateText(listing.description, 100)}
              </p>
              <div className="flex justify-between mt-2">
                <span className="font-medium">{formatCurrency(listing.price)}</span>
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--secondary)' }}>
                  {listing.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
