import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// [TRACED:TS-006] Dedicated keyboard navigation test file
describe('Keyboard Navigation', () => {
  it('skip-to-content link receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <nav>
          <a href="/">Home</a>
          <a href="/transactions">Transactions</a>
        </nav>
        <main id="main-content">
          <h1>Page Content</h1>
        </main>
      </div>,
    );

    await user.tab();

    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(document.activeElement).toBe(skipLink);
  });

  it('Tab navigates through navigation links in order', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <nav>
        <a href="/">Home</a>
        <a href="/transactions">Transactions</a>
        <a href="/disputes">Disputes</a>
        <a href="/payouts">Payouts</a>
      </nav>,
    );

    await user.tab();
    expect(document.activeElement).toBe(getByText('Home'));

    await user.tab();
    expect(document.activeElement).toBe(getByText('Transactions'));

    await user.tab();
    expect(document.activeElement).toBe(getByText('Disputes'));

    await user.tab();
    expect(document.activeElement).toBe(getByText('Payouts'));
  });

  it('Shift+Tab navigates backwards through links', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <nav>
        <a href="/">Home</a>
        <a href="/transactions">Transactions</a>
        <a href="/disputes">Disputes</a>
      </nav>,
    );

    // Tab forward to Disputes
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(getByText('Disputes'));

    // Shift+Tab back
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getByText('Transactions'));
  });

  it('Enter activates focused button', async () => {
    const user = userEvent.setup();
    let clicked = false;
    const { getByText } = render(
      <button onClick={() => { clicked = true; }}>Submit</button>,
    );

    await user.tab();
    expect(document.activeElement).toBe(getByText('Submit'));

    await user.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('Space activates focused button', async () => {
    const user = userEvent.setup();
    let clicked = false;
    const { getByText } = render(
      <button onClick={() => { clicked = true; }}>Action</button>,
    );

    await user.tab();
    await user.keyboard(' ');
    expect(clicked).toBe(true);
  });

  it('form inputs can be tabbed through', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <label htmlFor="kb-email">Email</label>
        <input id="kb-email" name="email" type="email" />
        <label htmlFor="kb-password">Password</label>
        <input id="kb-password" name="password" type="password" />
        <button type="submit">Sign In</button>
      </form>,
    );

    await user.tab();
    expect(document.activeElement).toBe(container.querySelector('#kb-email'));

    await user.tab();
    expect(document.activeElement).toBe(container.querySelector('#kb-password'));

    await user.tab();
    expect(document.activeElement?.textContent).toBe('Sign In');
  });

  it('error heading receives focus via tabIndex=-1', () => {
    const { container } = render(
      <div role="alert">
        <h2 tabIndex={-1}>Error occurred</h2>
        <button>Retry</button>
      </div>,
    );

    const heading = container.querySelector('h2');
    heading?.focus();
    expect(document.activeElement).toBe(heading);
  });

  it('disabled buttons are not focusable via Tab', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <div>
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <button>Also Enabled</button>
      </div>,
    );

    await user.tab();
    expect(document.activeElement).toBe(getByText('Enabled'));

    await user.tab();
    expect(document.activeElement).toBe(getByText('Also Enabled'));
  });
});
