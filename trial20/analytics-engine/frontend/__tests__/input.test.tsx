import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" aria-label="Test input" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Input disabled aria-label="Disabled input" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have no accessibility violations with label', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test</Label>
        <Input id="test-input" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
