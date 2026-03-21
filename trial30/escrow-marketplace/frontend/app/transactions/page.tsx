import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Website development project</TableCell>
                <TableCell>$5,000.00</TableCell>
                <TableCell>USD</TableCell>
                <TableCell><Badge>Released</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Logo design services</TableCell>
                <TableCell>$1,200.50</TableCell>
                <TableCell>USD</TableCell>
                <TableCell><Badge variant="destructive">Disputed</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Content writing package</TableCell>
                <TableCell>750.00</TableCell>
                <TableCell>EUR</TableCell>
                <TableCell><Badge variant="secondary">Funded</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
