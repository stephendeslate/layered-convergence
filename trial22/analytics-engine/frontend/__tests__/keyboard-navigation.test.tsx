// [TRACED:TS-008] Keyboard navigation tests for Tab order, Enter/Space activation, focus management
// [TRACED:UI-028] Keyboard accessibility validation

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Nav } from '../components/nav';

expect.extend(toHaveNoViolations);

describe('Keyboard Navigation', () => {
  describe('Tab order', () => {
    it('tabs through navigation links in order', async () => {
      const user = userEvent.setup();
      render(<Nav />);

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Analytics Engine');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Dashboards');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Data Sources');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Pipelines');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Login');
    });

    it('tabs through form inputs in order', async () => {
      const user = userEvent.setup();
      render(
        <form>
          <label htmlFor="name">Name</label>
          <Input id="name" placeholder="Enter name" />
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" placeholder="Enter email" />
          <Button type="submit">Submit</Button>
        </form>,
      );

      await user.tab();
      expect(document.activeElement?.getAttribute('id')).toBe('name');

      await user.tab();
      expect(document.activeElement?.getAttribute('id')).toBe('email');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Submit');
    });

    it('reverse tabs with Shift+Tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>,
      );

      await user.tab();
      await user.tab();
      await user.tab();
      expect(document.activeElement?.textContent).toBe('Third');

      await user.tab({ shift: true });
      expect(document.activeElement?.textContent).toBe('Second');

      await user.tab({ shift: true });
      expect(document.activeElement?.textContent).toBe('First');
    });
  });

  describe('Enter/Space activation', () => {
    it('activates button with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('activates button with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.tab();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not activate disabled button with Enter', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Focus management', () => {
    it('skip-to-content link becomes visible on focus', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <nav>
            <a href="/dashboard">Dashboard</a>
          </nav>
          <main id="main-content">Content</main>
        </div>,
      );

      await user.tab();
      const skipLink = screen.getByText('Skip to content');
      expect(document.activeElement).toBe(skipLink);
    });

    it('focus is visible on interactive elements', async () => {
      const user = userEvent.setup();
      render(<Button>Focused Button</Button>);

      await user.tab();
      const button = screen.getByText('Focused Button');
      expect(document.activeElement).toBe(button);
      expect(button.className).toContain('focus-visible');
    });

    it('disabled elements are not focusable via tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button>Also Enabled</Button>
        </div>,
      );

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Enabled');

      await user.tab();
      expect(document.activeElement?.textContent).toBe('Also Enabled');
    });
  });

  describe('Accessibility audit', () => {
    it('navigation passes axe audit for keyboard accessibility', async () => {
      const { container } = render(<Nav />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('form with inputs passes axe audit', async () => {
      const { container } = render(
        <form>
          <label htmlFor="test-input">Test</label>
          <Input id="test-input" />
          <Button type="submit">Submit</Button>
        </form>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
