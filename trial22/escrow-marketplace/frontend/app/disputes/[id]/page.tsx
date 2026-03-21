'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface Dispute {
  id: string;
  transactionId: string;
  filedBy: string;
  reason: string;
  status: string;
  resolution: string | null;
  createdAt: string;
}

export default function DisputeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState<string>('');

  useEffect(() => {
    async function fetchDispute() {
      const response = await apiFetch(`/disputes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDispute(data);
      }
      setLoading(false);
    }
    fetchDispute();
  }, [id]);

  async function handleResolve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResolving(true);

    const formData = new FormData(e.currentTarget);
    const resolution = formData.get('resolution') as string;

    const response = await apiFetch(`/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution, outcome }),
    });

    if (response.ok) {
      const data = await response.json();
      setDispute(data);
    }
    setResolving(false);
  }

  if (loading) {
    return (
      <div role="status" aria-busy="true">
        <p>Loading dispute...</p>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div role="alert">
        <p>Dispute not found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dispute Details</CardTitle>
            <Badge
              variant={dispute.status === 'OPEN' ? 'destructive' : 'success'}
            >
              {dispute.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium">{dispute.reason}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-sm">{dispute.transactionId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Filed By</p>
            <p className="font-mono text-sm">{dispute.filedBy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(dispute.createdAt).toLocaleString()}</p>
          </div>

          {dispute.resolution && (
            <div>
              <p className="text-sm text-muted-foreground">Resolution</p>
              <p className="font-medium">{dispute.resolution}</p>
            </div>
          )}

          {dispute.status === 'OPEN' && (
            <form onSubmit={handleResolve} className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Resolve Dispute</h3>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Input
                  id="resolution"
                  name="resolution"
                  required
                  placeholder="Describe the resolution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger id="outcome">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REFUNDED">Refund to Buyer</SelectItem>
                    <SelectItem value="DISMISSED">
                      Dismiss (Return to Funded)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={resolving || !outcome}>
                {resolving ? 'Resolving...' : 'Resolve Dispute'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
