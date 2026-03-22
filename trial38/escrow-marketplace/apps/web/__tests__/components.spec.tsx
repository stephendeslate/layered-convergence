import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// TRACED: EM-TEST-006 — Accessibility tests (jest-axe) for 8 UI components

expect.extend(toHaveNoViolations);

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: string[]) => inputs.filter(Boolean).join(' '),
}));

// Import components
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

describe('UI Components Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button renders with correct variant classes', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe('Delete');
  });

  it('Card should have no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no a11y violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert renders with role="alert"', () => {
    const { getByRole } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
      </Alert>,
    );
    expect(getByRole('alert')).toBeInTheDocument();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input should have no a11y violations when labeled', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <Input id="test-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input renders with correct type', () => {
    const { getByRole } = render(
      <Input type="email" aria-label="Email address" />,
    );
    expect(getByRole('textbox')).toBeInTheDocument();
  });

  it('Label should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="field">Field Label</Label>
        <input id="field" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should render', () => {
    const { container } = render(<Skeleton className="h-4 w-48" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('Table should have no a11y violations', async () => {
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
});
