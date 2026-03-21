import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Label } from '@/components/ui/label';

expect.extend(toHaveNoViolations);

describe('Label', () => {
  it('should render with text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render as a label element', () => {
    const { container } = render(<Label>Name</Label>);
    expect(container.firstChild?.nodeName).toBe('LABEL');
  });

  it('should apply htmlFor attribute', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input');
  });

  it('should apply custom className', () => {
    render(<Label className="custom">Custom</Label>);
    expect(screen.getByText('Custom').className).toContain('custom');
  });

  it('should apply font-medium class', () => {
    render(<Label>Styled</Label>);
    expect(screen.getByText('Styled')).toHaveClass('font-medium');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('should have no accessibility violations when paired with input', async () => {
    const { container } = render(
      <>
        <Label htmlFor="name">Name</Label>
        <input id="name" type="text" />
      </>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
