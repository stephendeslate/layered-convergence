import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from '@/components/ui/textarea';

expect.extend(toHaveNoViolations);

describe('Textarea', () => {
  it('should render a textarea element', () => {
    render(<Textarea aria-label="text area" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept and display a placeholder', () => {
    render(<Textarea placeholder="Enter text here" aria-label="textarea" />);
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled aria-label="disabled" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="textarea" />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hello world');
    expect(textarea).toHaveValue('hello world');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="ref" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" aria-label="custom" />);
    expect(screen.getByRole('textbox').className).toContain('custom-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <label>
        Description
        <Textarea />
      </label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
