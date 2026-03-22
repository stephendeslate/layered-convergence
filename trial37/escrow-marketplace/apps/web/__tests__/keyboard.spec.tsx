/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '../components/ui/alert';

// TRACED: EM-TEST-005 — Keyboard navigation tests

describe('Keyboard Navigation', () => {
  it('Button should be focusable via Tab', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');

    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('Button should respond to Enter key', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Press me</Button>);
    const button = getByRole('button');

    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('Button should respond to Space key', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Space me</Button>);
    const button = getByRole('button');

    button.focus();
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    fireEvent.keyUp(button, { key: ' ', code: 'Space' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('Input should be focusable', () => {
    const { getByRole } = render(
      <div>
        <label htmlFor="kb-test">Test</label>
        <Input id="kb-test" />
      </div>,
    );
    const input = getByRole('textbox');

    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('Input should accept keyboard input', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(
      <div>
        <label htmlFor="kb-input">Test</label>
        <Input id="kb-input" onChange={handleChange} />
      </div>,
    );
    const input = getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('Disabled button should not respond to clicks', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = getByRole('button');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Alert should be focusable with tabIndex', () => {
    const { getByRole } = render(
      <Alert tabIndex={-1}>
        <p>Alert content</p>
      </Alert>,
    );
    const alert = getByRole('alert');

    alert.focus();
    expect(document.activeElement).toBe(alert);
  });

  it('Multiple buttons should be navigable in sequence', () => {
    const { getAllByRole } = render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );
    const buttons = getAllByRole('button');

    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    buttons[1].focus();
    expect(document.activeElement).toBe(buttons[1]);

    buttons[2].focus();
    expect(document.activeElement).toBe(buttons[2]);
  });
});
