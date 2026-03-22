// TRACED: EM-TEST-008 — Accessibility tests with jest-axe
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

expect.extend(toHaveNoViolations);

describe('UI Component Accessibility', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <Input id="test-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no accessibility violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="label-test">Label Text</Label>
        <Input id="label-test" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should have no accessibility violations', async () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description text.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
