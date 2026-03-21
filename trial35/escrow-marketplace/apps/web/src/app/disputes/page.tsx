// TRACED: EM-UI-DISP-001 — Disputes page
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

export default function DisputesPage() {
  const disputes = [
    { id: '1', reason: 'Item not as described', amount: '5000.00', status: 'OPEN' },
    { id: '2', reason: 'Delivery issue', amount: '350.00', status: 'RESOLVED' },
    { id: '3', reason: 'Unauthorized transaction', amount: '1200.00', status: 'OPEN' },
  ];

  const statusVariant = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'default' as const;
      case 'OPEN': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reason</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell className="font-medium">{dispute.reason}</TableCell>
              <TableCell>{formatCurrency(dispute.amount)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(dispute.status)}>{dispute.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
