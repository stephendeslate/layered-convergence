import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

describe('UI Components', () => {
  it('Button renders with correct text', () => {
    const { getByRole } = render(<Button>Click</Button>);
    expect(getByRole('button')).toHaveTextContent('Click');
  });

  it('Button applies variant styles', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const button = getByRole('button');
    expect(button.className).toContain('destructive');
  });

  it('Card renders children', () => {
    const { getByText } = render(<Card>Card Content</Card>);
    expect(getByText('Card Content')).toBeDefined();
  });

  it('Input renders with type', () => {
    const { getByRole } = render(<Input type="email" />);
    const input = getByRole('textbox');
    expect(input.getAttribute('type')).toBe('email');
  });

  it('Label renders with htmlFor', () => {
    const { getByText } = render(<Label htmlFor="test">Test Label</Label>);
    const label = getByText('Test Label');
    expect(label.getAttribute('for')).toBe('test');
  });

  it('Badge renders with variant', () => {
    const { getByText } = render(<Badge variant="success">Done</Badge>);
    expect(getByText('Done')).toBeDefined();
  });

  it('Table renders', () => {
    const { getByRole } = render(
      <Table>
        <thead><tr><th>Header</th></tr></thead>
        <tbody><tr><td>Data</td></tr></tbody>
      </Table>,
    );
    expect(getByRole('table')).toBeDefined();
  });

  it('Select renders options', () => {
    const options = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];
    const { getAllByRole } = render(
      <Select value="" onChange={() => {}} options={options} aria-label="Test" />,
    );
    // +1 for the default "Select..." option
    expect(getAllByRole('option').length).toBe(3);
  });
});
