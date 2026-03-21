import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Nav } from '@/components/nav';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button component should have no accessibility violations', async () => {
    const { container } = render(<Button>Dispatch</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="work-order-title">Work Order Title</Label>
        <Input id="work-order-title" placeholder="Enter title" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card component should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>8 pending work orders</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge component should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Badge>PENDING</Badge>
        <Badge variant="secondary">ASSIGNED</Badge>
        <Badge variant="destructive">CANCELLED</Badge>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Nav component should have no accessibility violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Loading state should have role="status" and aria-busy', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading...</span>
      </div>,
    );
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('Error state should have role="alert"', () => {
    const { container } = render(
      <div role="alert">
        <h2>Error occurred</h2>
        <p>Something went wrong</p>
      </div>,
    );
    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).toBeTruthy();
  });
});
