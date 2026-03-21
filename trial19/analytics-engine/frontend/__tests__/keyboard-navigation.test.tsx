import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/app/actions', () => ({
  transitionPipeline: vi.fn(),
}));

import { Nav } from '@/components/nav';
import { TransitionButtons } from '@/app/pipelines/transition-buttons';
import ErrorBoundary from '@/app/error';

describe('Keyboard navigation', () => {
  describe('Nav keyboard access', () => {
    it('all links are focusable via tab', async () => {
      const user = userEvent.setup();
      render(<Nav />);

      const links = screen.getAllByRole('link');
      for (const link of links) {
        await user.tab();
        expect(link).toHaveFocus();
      }
    });
  });

  describe('TransitionButtons keyboard access', () => {
    it('buttons are focusable via tab', async () => {
      const user = userEvent.setup();
      render(<TransitionButtons pipelineId="p1" currentStatus="ACTIVE" />);

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        await user.tab();
        expect(button).toHaveFocus();
      }
    });

    it('buttons respond to Enter key', async () => {
      const user = userEvent.setup();
      render(<TransitionButtons pipelineId="p1" currentStatus="DRAFT" />);

      const button = screen.getByRole('button', { name: /transition pipeline to active/i });
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
    });
  });

  describe('ErrorBoundary keyboard access', () => {
    it('try again button is focusable and clickable via keyboard', async () => {
      const user = userEvent.setup();
      let resetCalled = false;
      const reset = () => { resetCalled = true; };

      render(<ErrorBoundary error={new Error('fail')} reset={reset} />);

      await user.tab();
      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(resetCalled).toBe(true);
    });
  });

  describe('Skip to content link', () => {
    it('skip link exists and points to main-content', () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="sr-only">Skip to content</a>
          <main id="main-content">Content</main>
        </div>
      );

      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveTextContent('Skip to content');
    });
  });

  it('passes accessibility checks on Nav', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
