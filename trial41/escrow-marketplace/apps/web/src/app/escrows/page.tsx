import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function EscrowsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Escrows</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Escrow Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>$299.99</TableCell>
                <TableCell>$0.00</TableCell>
                <TableCell><Badge variant="secondary">Released</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
