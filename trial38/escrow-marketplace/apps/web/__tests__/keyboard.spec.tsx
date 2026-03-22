import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TRACED: EM-TEST-008 — Keyboard navigation tests

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: string[]) => inputs.filter(Boolean).join(' '),
}));

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('Button should be focusable via Tab', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Button>Click</Button>);

    await user.tab();

    expect(getByRole('button')).toHaveFocus();
  });

  it('Button should activate on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should activate on Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input should be focusable via Tab', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <Input type="text" aria-label="Test input" />,
    );

    await user.tab();

    expect(getByRole('textbox')).toHaveFocus();
  });

  it('Input should accept keyboard input', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <Input type="text" aria-label="Test input" />,
    );

    await user.tab();
    await user.type(getByRole('textbox'), 'hello');

    expect(getByRole('textbox')).toHaveValue('hello');
  });

  it('Disabled button should not receive focus', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Button disabled>Disabled</Button>);

    await user.tab();

    expect(getByRole('button')).not.toHaveFocus();
  });

  it('Multiple buttons should be navigable with Tab', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(
      <>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </>,
    );

    const buttons = getAllByRole('button');

    await user.tab();
    expect(buttons[0]).toHaveFocus();

    await user.tab();
    expect(buttons[1]).toHaveFocus();

    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });

  it('Tab order should follow DOM order', async () => {
    const user = userEvent.setup();
    const focusOrder: string[] = [];
    const trackFocus = (name: string) => () => focusOrder.push(name);

    render(
      <>
        <Input aria-label="First" onFocus={trackFocus('input')} />
        <Button onFocus={trackFocus('button')}>Click</Button>
      </>,
    );

    await user.tab();
    await user.tab();

    expect(focusOrder).toEqual(['input', 'button']);
  });
});
