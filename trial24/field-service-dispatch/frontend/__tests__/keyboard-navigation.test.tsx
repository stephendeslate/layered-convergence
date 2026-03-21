// [TRACED:TS-009] Keyboard navigation and accessibility tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Nav } from '../components/nav';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Keyboard navigation', () => {
  it('button is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Focus me</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();
  });

  it('button responds to Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press Enter</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('button responds to Space key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press Space</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('input is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Focus me" />);
    await user.tab();
    expect(screen.getByPlaceholderText('Focus me')).toHaveFocus();
  });

  it('nav has aria-label for accessibility', () => {
    render(<Nav />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('nav links are focusable', async () => {
    const user = userEvent.setup();
    render(<Nav />);
    await user.tab();
    const focused = document.activeElement;
    expect(focused?.tagName).toBe('A');
  });
});
