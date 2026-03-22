// TRACED: EM-WLST-001
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch, buildPaginationParams } from '@/lib/api';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  status: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    apiFetch<{ data: Listing[] }>(`/listings${buildPaginationParams()}`)
      .then((res) => setListings(res.data))
      .catch(() => setListings([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>{listing.title}</TableCell>
                <TableCell>${listing.price}</TableCell>
                <TableCell>
                  <Badge>{listing.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
