import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const INVOICES = [
  { id: 'inv-1', workOrder: 'HVAC System Inspection', amount: '$850.00', status: 'PAID', dueDate: '2026-04-22' },
  { id: 'inv-2', workOrder: 'Emergency Electrical Repair', amount: '$1,200.00', status: 'OVERDUE', dueDate: '2026-02-15' },
];

function statusVariant(status: string) {
  switch (status) {
    case 'PAID': return 'default' as const;
    case 'SENT': return 'secondary' as const;
    case 'OVERDUE': return 'destructive' as const;
    case 'VOID': return 'destructive' as const;
    default: return 'outline' as const;
  }
}

export default function InvoicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.workOrder}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
