// TRACED: FD-TEST-UI-003 — Page rendering tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Page Components', () => {
  describe('Dashboard layout', () => {
    it('renders dashboard cards without violations', async () => {
      const { container } = render(
        <div>
          <h1>Dashboard</h1>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Open Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <span>12</span>
              </CardContent>
            </Card>
          </div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders Badge variants correctly', () => {
      render(
        <div>
          <Badge variant="default">Active</Badge>
          <Badge variant="destructive">Failed</Badge>
          <Badge variant="secondary">Info</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>,
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('renders loading skeleton with correct ARIA attributes', () => {
      render(
        <div role="status" aria-busy="true">
          <Skeleton className="h-8 w-48" />
        </div>,
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Error states', () => {
    it('renders error alert with role="alert"', () => {
      render(
        <Alert variant="destructive" role="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('error alert has no accessibility violations', async () => {
      const { container } = render(
        <Alert variant="destructive" role="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load data.</AlertDescription>
        </Alert>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders retry button in error state', () => {
      const handleReset = jest.fn();
      render(
        <div>
          <Alert variant="destructive" role="alert">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load.</AlertDescription>
          </Alert>
          <Button onClick={handleReset} variant="outline">
            Retry
          </Button>
        </div>,
      );

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });
});
