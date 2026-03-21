'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';

interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'DISPUTE':
      return 'destructive';
    case 'REFUNDED':
      return 'warning';
    case 'PENDING':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function TransactionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchTransaction() {
      const response = await apiFetch(`/transactions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTransaction(data);
      }
      setLoading(false);
    }
    fetchTransaction();
  }, [id]);

  async function handleStatusUpdate(status: string) {
    setActionLoading(true);
    const response = await apiFetch(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const data = await response.json();
      setTransaction(data);
    }
    setActionLoading(false);
  }

  async function handleDispute() {
    setActionLoading(true);
    const response = await apiFetch('/disputes', {
      method: 'POST',
      body: JSON.stringify({
        transactionId: id,
        reason: 'Dispute filed from transaction detail',
      }),
    });

    if (response.ok) {
      // Refresh transaction to show DISPUTE status
      const txResponse = await apiFetch(`/transactions/${id}`);
      if (txResponse.ok) {
        const data = await txResponse.json();
        setTransaction(data);
      }
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div role="status" aria-busy="true">
        <p>Loading transaction...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div role="alert">
        <p>Transaction not found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Details</CardTitle>
            <Badge variant={statusVariant(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{transaction.description}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">${transaction.amount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Buyer ID</p>
            <p className="font-mono text-sm">{transaction.buyerId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Seller ID</p>
            <p className="font-mono text-sm">{transaction.sellerId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(transaction.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {transaction.status === 'PENDING' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={actionLoading}>Fund Transaction</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Funding</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to fund ${transaction.amount} into escrow?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleStatusUpdate('FUNDED')}>
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {transaction.status === 'FUNDED' && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate('SHIPPED')}
              >
                Mark Shipped
              </Button>
            )}

            {transaction.status === 'SHIPPED' && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate('DELIVERED')}
              >
                Confirm Delivery
              </Button>
            )}

            {transaction.status === 'DELIVERED' && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate('COMPLETED')}
              >
                Release Funds
              </Button>
            )}

            {['FUNDED', 'SHIPPED', 'DELIVERED'].includes(
              transaction.status,
            ) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={actionLoading}>
                    File Dispute
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>File a Dispute</DialogTitle>
                    <DialogDescription>
                      This will pause the transaction and initiate a dispute
                      resolution process.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={handleDispute}>
                        File Dispute
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
