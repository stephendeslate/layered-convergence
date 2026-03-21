import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

expect.extend(toHaveNoViolations);

// TRACED: FD-AX-JEST-001 — jest-axe accessibility tests on real components
describe('Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card should have no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input with Label should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test">Test Label</Label>
        <Input id="test" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Alert should have no a11y violations', async () => {
    const { container } = render(
      <Alert>
        <AlertDescription>Alert message</AlertDescription>
      </Alert>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Table should have no a11y violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow><TableHead>Header</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>Cell</TableCell></TableRow>
        </TableBody>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Skeleton should have no a11y violations', async () => {
    const { container } = render(<Skeleton className="h-10 w-48" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('multiple Buttons should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Button variant="default">Primary</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="outline">Cancel</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
