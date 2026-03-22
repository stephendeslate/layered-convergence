// TRACED: EM-WDSP-001
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch, buildPaginationParams } from '@/lib/api';

interface DisputeItem {
  id: string;
  reason: string;
  status: string;
  transactionId: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);

  useEffect(() => {
    apiFetch<{ data: DisputeItem[] }>(`/disputes${buildPaginationParams()}`)
      .then((res) => setDisputes(res.data))
      .catch(() => setDisputes([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell>{dispute.id.slice(0, 8)}</TableCell>
                <TableCell>{dispute.reason}</TableCell>
                <TableCell>
                  <Badge>{dispute.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
