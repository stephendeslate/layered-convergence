'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { apiFetch } from '@/lib/api';

interface Dispute {
  id: string;
  transactionId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisputes() {
      const response = await apiFetch('/disputes');
      if (response.ok) {
        const data = await response.json();
        setDisputes(data);
      }
      setLoading(false);
    }
    fetchDisputes();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true">
        <p>Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell>{dispute.reason}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    dispute.status === 'OPEN' ? 'destructive' : 'success'
                  }
                >
                  {dispute.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(dispute.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link href={`/disputes/${dispute.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {disputes.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No disputes found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
