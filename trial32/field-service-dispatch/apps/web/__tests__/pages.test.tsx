// [TRACED:FD-TS-004] Frontend axe-core accessibility tests
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

function TestButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white"
    >
      Create Work Order
    </button>
  );
}

function TestCard() {
  return (
    <div className="rounded-lg border p-6">
      <h3>Work Order Details</h3>
      <p>Status: IN_PROGRESS</p>
    </div>
  );
}

function TestForm() {
  return (
    <form>
      <div>
        <label htmlFor="test-email">Email</label>
        <input id="test-email" name="email" type="email" required aria-required="true" />
      </div>
      <div>
        <label htmlFor="test-password">Password</label>
        <input id="test-password" name="password" type="password" required aria-required="true" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function TestTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>HVAC Repair</td>
          <td>PENDING</td>
          <td>HIGH</td>
        </tr>
      </tbody>
    </table>
  );
}

function TestNav() {
  return (
    <nav aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/work-orders">Work Orders</a>
      <a href="/customers">Customers</a>
    </nav>
  );
}

describe('Accessibility Tests', () => {
  it('Button component should have no axe violations', async () => {
    const { container } = render(<TestButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card component should have no axe violations', async () => {
    const { container } = render(<TestCard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form should have no axe violations', async () => {
    const { container } = render(<TestForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no axe violations', async () => {
    const { container } = render(<TestTable />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Navigation should have no axe violations', async () => {
    const { container } = render(<TestNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
