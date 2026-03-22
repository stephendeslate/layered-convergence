// TRACED: AE-TEST-004
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert } from '../components/ui/alert';
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
          <h2>Card Title</h2>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
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
      <div>
        <Label htmlFor="field">Field label</Label>
        <input id="field" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(<Alert>Something happened</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton should have no accessibility violations', async () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <Skeleton style={{ height: '2rem', width: '10rem' }} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no accessibility violations', async () => {
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
