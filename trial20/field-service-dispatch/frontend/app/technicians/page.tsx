import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Technician } from '@/lib/types';

function getAvailabilityVariant(availability: string) {
  switch (availability) {
    case 'AVAILABLE': return 'success' as const;
    case 'ON_JOB': return 'default' as const;
    case 'OFF_DUTY': return 'secondary' as const;
    default: return 'outline' as const;
  }
}

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
      <h1 className="text-3xl font-bold">Technicians</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No technicians yet.
                  </TableCell>
                </TableRow>
              ) : (
                technicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.user?.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tech.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAvailabilityVariant(tech.availability)}>
                        {tech.availability}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
