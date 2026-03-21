import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboards</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Widgets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sales Overview</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>User Metrics</TableCell>
                <TableCell>
                  <Badge variant="secondary">Draft</Badge>
                </TableCell>
                <TableCell>3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
