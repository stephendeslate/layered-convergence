// [TRACED:UI-014] Technicians list page with table and CRUD actions

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        const res = await apiFetch('/technicians');
        if (res.ok) {
          const data = await res.json();
          setTechnicians(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  if (loading) {
    return <p className="text-[var(--muted-foreground)]">Loading technicians...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Technicians</h1>
        <Button>Add Technician</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {technicians.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No technicians found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.email}</TableCell>
                    <TableCell>{tech.phone ?? '—'}</TableCell>
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
