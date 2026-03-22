import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { truncateText, formatCurrency } from '@escrow-marketplace/shared';

// TRACED: EM-FE-007 — No raw select elements in pages

export default function ListingsPage() {
  const sampleListings = [
    { id: '1', title: 'Vintage Watch', price: '299.99', status: 'ACTIVE', description: 'A beautiful vintage timepiece in excellent condition with original box' },
    { id: '2', title: 'Leather Bag', price: '149.50', status: 'ACTIVE', description: 'Handcrafted genuine leather messenger bag with adjustable strap' },
    { id: '3', title: 'Art Print Collection', price: '75.00', status: 'SOLD', description: 'Set of 5 limited edition art prints by emerging artists' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace Listings</h1>

      <Table>
        <thead>
          <tr>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Description</th>
            <th className="text-left p-3">Price</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {sampleListings.map((listing) => (
            <tr key={listing.id} className="border-t">
              <td className="p-3 font-medium">{listing.title}</td>
              <td className="p-3 text-gray-600">{truncateText(listing.description, 50)}</td>
              <td className="p-3">{formatCurrency(listing.price)}</td>
              <td className="p-3">
                <Badge
                  variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {listing.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleListings.map((listing) => (
          <Card key={listing.id} className="p-4">
            <h3 className="font-semibold mb-2">{listing.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {truncateText(listing.description, 60)}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-bold">{formatCurrency(listing.price)}</span>
              <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {listing.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
