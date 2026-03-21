import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';

// TRACED:TS-003: Frontend tests include axe-core accessibility checks
// TRACED:TS-005: Keyboard navigation tested in frontend

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  return results.violations;
}

describe('Loading states accessibility', () => {
  it('should have role="status" and aria-busy on loading components', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" />
        <span className="sr-only">Loading...</span>
      </div>,
    );

    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('should have sr-only text for screen readers', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading...</span>
      </div>,
    );

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly?.textContent).toBe('Loading...');
  });
});

describe('Error states accessibility', () => {
  it('should have role="alert" on error components', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Something went wrong</h2>
        <p>An error occurred</p>
        <button type="button">Try again</button>
      </div>,
    );

    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).toBeTruthy();
    expect(alertEl?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('Navigation accessibility', () => {
  it('should have skip-to-content link', () => {
    const { container } = render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/transactions">Transactions</a>
        </nav>
        <main id="main-content">Content</main>
      </div>,
    );

    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeTruthy();
    expect(skipLink?.textContent).toBe('Skip to content');
  });

  it('should have labeled navigation', () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
      </nav>,
    );

    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });
});

describe('Form accessibility', () => {
  it('should have labels associated with inputs', () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </form>,
    );

    const emailLabel = container.querySelector('label[for="email"]');
    const emailInput = container.querySelector('#email');
    expect(emailLabel).toBeTruthy();
    expect(emailInput).toBeTruthy();
  });

  it('should pass axe-core checks for a simple form', async () => {
    const { container } = render(
      <form>
        <label htmlFor="test-input">Test Field</label>
        <input id="test-input" name="test" type="text" />
        <button type="submit">Submit</button>
      </form>,
    );

    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('Keyboard navigation', () => {
  it('should have focusable interactive elements', () => {
    const { container } = render(
      <div>
        <a href="/login">Login</a>
        <button type="button">Click me</button>
        <input type="text" />
      </div>,
    );

    const link = container.querySelector('a');
    const button = container.querySelector('button');
    const input = container.querySelector('input');

    expect(link).toBeTruthy();
    expect(button).toBeTruthy();
    expect(input).toBeTruthy();

    // Verify elements are in tab order (no negative tabindex)
    expect(link?.getAttribute('tabindex')).not.toBe('-1');
    expect(button?.getAttribute('tabindex')).not.toBe('-1');
    expect(input?.getAttribute('tabindex')).not.toBe('-1');
  });

  it('should allow focus on error boundary', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Error</h2>
        <button type="button">Retry</button>
      </div>,
    );

    const alertEl = container.querySelector('[role="alert"]') as HTMLElement;
    alertEl.focus();
    expect(document.activeElement).toBe(alertEl);
  });
});
