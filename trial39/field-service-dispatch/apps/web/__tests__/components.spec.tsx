// TRACED: FD-TEST-UI-001 — Component accessibility tests with jest-axe
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';

expect.extend(toHaveNoViolations);

describe('UI Component Accessibility', () => {
  it('Button has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button renders all variants without violations', async () => {
    const { container } = render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge renders with correct text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('Badge has no accessibility violations', async () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card composition has no accessibility violations', async () => {
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

  it('Input with Label has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert with role="alert" has no accessibility violations', async () => {
    const { container } = render(
      <Alert variant="destructive" role="alert">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Skeleton renders with animate-pulse class', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('Table has no accessibility violations', async () => {
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
            <TableCell>Alice</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled Button cannot be clicked', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });
});
