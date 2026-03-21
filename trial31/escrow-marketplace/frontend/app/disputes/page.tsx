import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function DisputesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Disputes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">dsp_001</TableCell>
                <TableCell>Deliverables do not match specifications</TableCell>
                <TableCell className="font-mono text-sm">txn_002</TableCell>
                <TableCell><Badge variant="secondary">UNDER_REVIEW</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">dsp_002</TableCell>
                <TableCell>Seller unresponsive for 14 days</TableCell>
                <TableCell className="font-mono text-sm">txn_002</TableCell>
                <TableCell><Badge variant="destructive">ESCALATED</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
