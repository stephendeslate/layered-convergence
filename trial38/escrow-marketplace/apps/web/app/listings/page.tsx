import dynamic from 'next/dynamic';
import { formatCurrency, truncateText } from '@escrow-marketplace/shared';

// TRACED: EM-PERF-007 — next/dynamic import for bundle optimization
const ListingsTable = dynamic(() => import('./listings-table'), {
  loading: () => (
    <div role="status" aria-busy="true" className="py-8 text-center text-muted-foreground">
      <span className="sr-only">Loading listings table...</span>
      Loading...
    </div>
  ),
});

// TRACED: EM-FE-011 — Listings page with shared utility usage

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
      </div>
      <p className="text-muted-foreground">
        Browse active listings from verified sellers. Prices shown in{' '}
        {formatCurrency(0).replace('0.00', 'USD')}.
      </p>
      <ListingsTable />
    </div>
  );
}
