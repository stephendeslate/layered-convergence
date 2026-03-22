// TRACED:AE-ACCESSIBILITY-TEST
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
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
          <p>Card content</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" placeholder="Enter text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
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
            <TableCell>Item</TableCell>
            <TableCell>100</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
