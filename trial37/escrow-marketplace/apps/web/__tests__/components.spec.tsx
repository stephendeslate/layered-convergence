/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Table } from '../components/ui/table';

// TRACED: EM-TEST-004 — jest-axe on 8 UI components

expect.extend(toHaveNoViolations);

describe('UI Components Accessibility', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <p>Card content</p>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test</label>
        <Input id="test-input" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Label should have no accessibility violations', async () => {
    const { container } = render(
      <Label htmlFor="field">Field Label</Label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(
      <Alert variant="destructive">
        <p>Error message</p>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should have no accessibility violations', async () => {
    const { container } = render(
      <Skeleton className="h-12 w-48" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no accessibility violations', async () => {
    const { container } = render(
      <Table>
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
