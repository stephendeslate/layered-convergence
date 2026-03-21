import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Components', () => {
  it('button renders with correct text', () => {
    const { getByText } = render(<button>Click me</button>);
    expect(getByText('Click me')).not.toBeNull();
  });

  it('card renders with title and content', () => {
    const { getByText } = render(
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h3>Card Title</h3>
        </div>
        <div className="p-6 pt-0">
          <p>Card content</p>
        </div>
      </div>,
    );

    expect(getByText('Card Title')).not.toBeNull();
    expect(getByText('Card content')).not.toBeNull();
  });

  it('badge renders with text', () => {
    const { getByText } = render(
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
        PENDING
      </span>,
    );

    expect(getByText('PENDING')).not.toBeNull();
  });

  it('input has accessible attributes', async () => {
    const { container } = render(
      <main>
        <label htmlFor="c-test">Test Input</label>
        <input id="c-test" type="text" placeholder="Enter text" />
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('table structure renders correctly', () => {
    const { container, getByText } = render(
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </tbody>
      </table>,
    );

    expect(container.querySelector('table')).not.toBeNull();
    expect(getByText('Column 1')).not.toBeNull();
    expect(getByText('Cell 1')).not.toBeNull();
  });

  it('dialog structure has accessible markup', async () => {
    const { container } = render(
      <main>
        <div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
          <h2 id="dialog-title">Confirm Action</h2>
          <p>Are you sure you want to proceed?</p>
          <button>Confirm</button>
          <button>Cancel</button>
        </div>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('navigation renders all links', () => {
    const { getByText } = render(
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/transactions">Transactions</a>
        <a href="/disputes">Disputes</a>
        <a href="/payouts">Payouts</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </nav>,
    );

    expect(getByText('Home')).not.toBeNull();
    expect(getByText('Transactions')).not.toBeNull();
    expect(getByText('Login')).not.toBeNull();
    expect(getByText('Register')).not.toBeNull();
  });
});
