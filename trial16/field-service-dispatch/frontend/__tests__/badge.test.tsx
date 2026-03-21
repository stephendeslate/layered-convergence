import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from '@/components/ui/badge';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('should render with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-primary');
  });

  it('should apply secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(container.firstChild).toHaveClass('bg-secondary');
  });

  it('should apply destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('should apply outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild).toHaveClass('text-foreground');
  });

  it('should apply success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-100');
  });

  it('should apply warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    expect(container.firstChild).toHaveClass('bg-yellow-100');
  });

  it('should apply info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    expect(container.firstChild).toHaveClass('bg-blue-100');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom">Custom</Badge>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should render as a div element', () => {
    const { container } = render(<Badge>Tag</Badge>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Badge>Accessible</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
