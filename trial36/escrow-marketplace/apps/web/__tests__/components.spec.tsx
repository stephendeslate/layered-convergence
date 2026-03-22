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
import { Dialog } from '../components/ui/dialog';
import { Select } from '../components/ui/select';
import { Alert } from '../components/ui/alert';

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

  it('Dialog should have no accessibility violations when open', async () => {
    const { container } = render(
      <Dialog open={true} onClose={() => {}}>
        <h2>Dialog Title</h2>
        <p>Dialog content</p>
      </Dialog>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Select should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-select">Choose</label>
        <Select id="test-select">
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </Select>
      </div>,
    );
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
});
