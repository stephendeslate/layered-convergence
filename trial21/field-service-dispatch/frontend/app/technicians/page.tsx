import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Technician } from '@/lib/types';

export default async function TechniciansPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let technicians: Technician[] = [];
  const response = await fetchWithAuth('/technicians');
  if (response.ok) {
    technicians = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Technicians</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {technicians.length === 0 ? (
            <p className="text-muted-foreground">No technicians found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.user?.email || t.userId}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.availability === 'AVAILABLE'
                            ? 'success'
                            : t.availability === 'ON_JOB'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {t.availability}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
