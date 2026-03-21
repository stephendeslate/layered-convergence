import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Select } from '@/components/ui/select';

expect.extend(toHaveNoViolations);

describe('Select', () => {
  it('should render a select element', () => {
    render(
      <Select aria-label="test select">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render options', () => {
    render(
      <Select aria-label="test">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>,
    );
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Select disabled aria-label="disabled">
        <option value="a">A</option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should handle selection', async () => {
    const user = userEvent.setup();
    render(
      <Select aria-label="pick">
        <option value="">Choose</option>
        <option value="x">X</option>
        <option value="y">Y</option>
      </Select>,
    );
    await user.selectOptions(screen.getByRole('combobox'), 'y');
    expect(screen.getByRole('combobox')).toHaveValue('y');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="ref">
        <option>Opt</option>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('should apply custom className', () => {
    render(
      <Select className="custom" aria-label="custom">
        <option>Opt</option>
      </Select>,
    );
    expect(screen.getByRole('combobox').className).toContain('custom');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <label>
        Color
        <Select>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
        </Select>
      </label>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
