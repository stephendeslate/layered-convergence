'use client';

import { formatCurrency, truncateText } from '@escrow-marketplace/shared';

// TRACED: EM-FE-012 — Listings table component (dynamically imported)

export default function ListingsTable() {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={3}
              className="px-4 py-8 text-center text-muted-foreground"
            >
              Sign in to view listings.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
