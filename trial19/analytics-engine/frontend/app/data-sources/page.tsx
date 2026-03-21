import { fetchDataSources } from '@/lib/api';
import { createDataSource } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DataSourceForm } from './data-source-form';

export default async function DataSourcesPage() {
  let dataSources;
  try {
    dataSources = await fetchDataSources();
  } catch {
    dataSources = [];
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button aria-label="Add data source">Add Data Source</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Data Source</DialogTitle>
              <DialogDescription>Connect a new data source to your tenant.</DialogDescription>
            </DialogHeader>
            <DataSourceForm />
          </DialogContent>
        </Dialog>
      </div>

      {dataSources.length === 0 ? (
        <p className="text-muted-foreground">No data sources configured yet.</p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell className="font-medium">{ds.name}</TableCell>
                    <TableCell>{ds.type}</TableCell>
                    <TableCell>
                      <Badge variant={ds.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {ds.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
