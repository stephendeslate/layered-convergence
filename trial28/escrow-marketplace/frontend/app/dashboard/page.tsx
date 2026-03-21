import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Escrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-[var(--muted-foreground)]">Funded transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$24,500</p>
            <p className="text-[var(--muted-foreground)]">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-[var(--muted-foreground)]">Pending resolution</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>TX-001</TableCell>
                <TableCell>$1,500.00</TableCell>
                <TableCell><Badge>RELEASED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TX-002</TableCell>
                <TableCell>$750.50</TableCell>
                <TableCell><Badge variant="destructive">DISPUTED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TX-003</TableCell>
                <TableCell>$3,200.00</TableCell>
                <TableCell><Badge variant="secondary">FUNDED</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
