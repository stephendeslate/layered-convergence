import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Loading from '@/app/loading';

expect.extend(toHaveNoViolations);

describe('Loading Component', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<Loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have role="status"', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should have aria-busy="true"', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-busy')).toBe('true');
  });

  it('should have sr-only text', () => {
    const { container } = render(<Loading />);
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeDefined();
    expect(srOnly?.textContent).toBe('Loading...');
  });
});
