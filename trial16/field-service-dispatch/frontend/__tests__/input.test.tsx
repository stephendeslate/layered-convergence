import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from '@/components/ui/input';

expect.extend(toHaveNoViolations);

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input aria-label="test input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept text type', () => {
    render(<Input type="text" aria-label="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('should accept email type', () => {
    render(<Input type="email" aria-label="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('should accept and display a placeholder', () => {
    render(<Input placeholder="Enter text" aria-label="input" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled aria-label="disabled" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="input" />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" aria-label="custom" />);
    expect(screen.getByRole('textbox').className).toContain('custom-class');
  });

  it('should have no accessibility violations', async () => {
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
