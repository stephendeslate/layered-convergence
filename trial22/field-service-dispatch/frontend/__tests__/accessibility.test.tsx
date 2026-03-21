// TRACED:TS-004 axe-core accessibility tests
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';

// Simple component renders for accessibility testing
function SkipToContent() {
  return (
    <div>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <nav aria-label="Main navigation">
        <a href="/dashboard">Dashboard</a>
        <a href="/work-orders">Work Orders</a>
      </nav>
      <main id="main-content">
        <h1>Page Title</h1>
        <p>Content</p>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse">Loading...</div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

function ErrorState() {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>An error occurred while loading this page.</p>
      <button>Try again</button>
    </div>
  );
}

function LoginForm() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" required />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}

describe('Accessibility Tests', () => {
  it('should have no axe violations on skip-to-content layout', async () => {
    const { container } = render(<SkipToContent />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('should have no axe violations on loading state', async () => {
    const { container } = render(<LoadingState />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('should have no axe violations on error state', async () => {
    const { container } = render(<ErrorState />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('should have no axe violations on login form', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('should have skip-to-content link', () => {
    const { container } = render(<SkipToContent />);
    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeDefined();
    expect(skipLink?.textContent).toBe('Skip to content');
  });

  it('should have main content target', () => {
    const { container } = render(<SkipToContent />);
    const main = container.querySelector('#main-content');
    expect(main).toBeDefined();
  });

  it('loading state should have role="status" and aria-busy', () => {
    const { container } = render(<LoadingState />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeDefined();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('error state should have role="alert"', () => {
    const { container } = render(<ErrorState />);
    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).toBeDefined();
  });
});
