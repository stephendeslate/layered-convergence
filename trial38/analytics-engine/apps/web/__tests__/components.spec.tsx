// TRACED: AE-TEST-05 - Frontend Component Tests
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
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

describe('UI Components Accessibility', () => {
  describe('Button', () => {
    it('renders without accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders all variants without violations', async () => {
      const { container } = render(
        <div>
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders disabled state correctly', () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);
      expect(getByRole('button')).toBeDisabled();
    });
  });

  describe('Badge', () => {
    it('renders without accessibility violations', async () => {
      const { container } = render(<Badge>Status</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders all variants', () => {
      const { getAllByText } = render(
        <div>
          <Badge variant="default">A</Badge>
          <Badge variant="secondary">B</Badge>
          <Badge variant="destructive">C</Badge>
          <Badge variant="outline">D</Badge>
        </div>,
      );
      expect(getAllByText(/[A-D]/)).toHaveLength(4);
    });
  });

  describe('Card', () => {
    it('renders full card without accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input', () => {
    it('renders without accessibility violations when labeled', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Name</Label>
          <Input id="test-input" placeholder="Enter name" />
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports disabled state', () => {
      const { getByRole } = render(<Input disabled aria-label="disabled input" />);
      expect(getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Alert', () => {
    it('renders with role="alert"', () => {
      const { getByRole } = render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Something happened</AlertDescription>
        </Alert>,
      );
      expect(getByRole('alert')).toBeTruthy();
    });

    it('renders destructive variant without violations', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Critical failure</AlertDescription>
        </Alert>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Skeleton', () => {
    it('renders without accessibility violations', async () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Table', () => {
    it('renders full table without accessibility violations', async () => {
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
              <TableCell>Dashboard 1</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
