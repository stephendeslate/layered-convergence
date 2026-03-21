import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">txn_001</TableCell>
                <TableCell>Web design project milestone 1</TableCell>
                <TableCell>$1,500.00</TableCell>
                <TableCell>USD</TableCell>
                <TableCell><Badge>RELEASED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">txn_002</TableCell>
                <TableCell>Mobile app development phase 2</TableCell>
                <TableCell>$3,200.50</TableCell>
                <TableCell>USD</TableCell>
                <TableCell><Badge variant="destructive">DISPUTED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">txn_003</TableCell>
                <TableCell>Logo design consultation</TableCell>
                <TableCell>750.00</TableCell>
                <TableCell>EUR</TableCell>
                <TableCell><Badge variant="secondary">REFUNDED</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
