import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input aria-label="test input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('supports placeholder text', () => {
    render(<Input placeholder="Enter value" aria-label="test" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('supports type attribute', () => {
    render(<Input type="email" aria-label="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('supports disabled state', () => {
    render(<Input disabled aria-label="disabled" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(
      <label>
        Email
        <Input type="email" />
      </label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
