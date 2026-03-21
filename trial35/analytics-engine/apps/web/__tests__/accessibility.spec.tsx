// TRACED: AE-TEST-006 — Accessibility tests with jest-axe
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button should have no violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge should have no violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card should have no violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input should have no violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test">Test</Label>
        <Input id="test" />
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Label should have no violations', async () => {
    const { container } = render(<Label htmlFor="x">Label</Label>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Alert should have no violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Alert</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Skeleton should have no violations', async () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Table should have no violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow><TableHead>Header</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>Cell</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
