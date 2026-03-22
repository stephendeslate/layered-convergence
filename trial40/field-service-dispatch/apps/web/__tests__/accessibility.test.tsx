// TRACED: FD-SEC-001 — Accessibility tests with jest-axe
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no a11y violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no a11y violations', async () => {
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

  it('Input with Label should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Name</Label>
        <Input id="test-input" placeholder="Enter name" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
