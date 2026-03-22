// TRACED:AE-TEST-08 — Accessibility tests with jest-axe on all 8 UI components

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

describe('UI Component Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test</label>
        <Input id="test-input" placeholder="Enter value" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Label should have no a11y violations', async () => {
    const { container } = render(
      <Label htmlFor="field">Field Name</Label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no a11y violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should have no a11y violations', async () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no a11y violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
            <TableCell>100</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
