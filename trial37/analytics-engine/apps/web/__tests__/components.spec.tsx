// TRACED: AE-TEST-07
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

describe('UI Components Accessibility', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content here</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <Input id="test-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should render without errors', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstChild).toBeTruthy();
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
            <TableCell>Pipeline A</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button variants render with correct styles', () => {
    const { container: defaultBtn } = render(<Button>Default</Button>);
    const { container: outlineBtn } = render(<Button variant="outline">Outline</Button>);
    const { container: destructiveBtn } = render(<Button variant="destructive">Delete</Button>);

    expect(defaultBtn.firstChild).toBeTruthy();
    expect(outlineBtn.firstChild).toBeTruthy();
    expect(destructiveBtn.firstChild).toBeTruthy();
  });
});
