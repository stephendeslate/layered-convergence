import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { validateRequiredString, validateRequiredNumber } from '@/lib/validation';

expect.extend(toHaveNoViolations);

describe('validateRequiredString', () => {
  it('returns trimmed string for valid input', () => {
    const formData = new FormData();
    formData.set('name', '  John Doe  ');
    expect(validateRequiredString(formData, 'name')).toBe('John Doe');
  });

  it('returns null for empty string', () => {
    const formData = new FormData();
    formData.set('name', '');
    expect(validateRequiredString(formData, 'name')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    const formData = new FormData();
    formData.set('name', '   ');
    expect(validateRequiredString(formData, 'name')).toBeNull();
  });

  it('returns null for missing field', () => {
    const formData = new FormData();
    expect(validateRequiredString(formData, 'name')).toBeNull();
  });
});

describe('validateRequiredNumber', () => {
  it('returns number for valid input', () => {
    const formData = new FormData();
    formData.set('amount', '100.50');
    expect(validateRequiredNumber(formData, 'amount')).toBe(100.50);
  });

  it('returns null for non-numeric input', () => {
    const formData = new FormData();
    formData.set('amount', 'abc');
    expect(validateRequiredNumber(formData, 'amount')).toBeNull();
  });

  it('returns null for empty string', () => {
    const formData = new FormData();
    formData.set('amount', '');
    expect(validateRequiredNumber(formData, 'amount')).toBeNull();
  });
});

// Accessibility test for a simple form using validation
describe('Form validation accessibility', () => {
  it('renders accessible form with validation', async () => {
    function TestForm() {
      return (
        <form>
          <label htmlFor="test-name">Name</label>
          <input id="test-name" name="name" type="text" required aria-required="true" />
          <label htmlFor="test-amount">Amount</label>
          <input id="test-amount" name="amount" type="number" required aria-required="true" />
          <button type="submit">Submit</button>
        </form>
      );
    }

    const { container } = render(<TestForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
