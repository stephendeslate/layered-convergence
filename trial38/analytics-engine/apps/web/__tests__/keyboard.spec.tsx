// TRACED: AE-TEST-06 - Frontend Keyboard Tests
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

describe('Keyboard Navigation', () => {
  describe('Button keyboard interaction', () => {
    it('can be focused via Tab', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Button>Click me</Button>);

      await user.tab();
      expect(getByRole('button')).toHaveFocus();
    });

    it('can be activated via Enter', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const { getByRole } = render(<Button onClick={onClick}>Click me</Button>);

      await user.tab();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('can be activated via Space', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const { getByRole } = render(<Button onClick={onClick}>Click me</Button>);

      await user.tab();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('cannot be focused when disabled', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Button disabled>Disabled</Button>);

      await user.tab();
      expect(getByRole('button')).not.toHaveFocus();
    });
  });

  describe('Input keyboard interaction', () => {
    it('can be focused via Tab', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Input aria-label="test input" />);

      await user.tab();
      expect(getByRole('textbox')).toHaveFocus();
    });

    it('accepts keyboard input', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Input aria-label="test input" />);

      await user.tab();
      await user.keyboard('Hello World');
      expect(getByRole('textbox')).toHaveValue('Hello World');
    });

    it('cannot be focused when disabled', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Input disabled aria-label="disabled" />);

      await user.tab();
      expect(getByRole('textbox')).not.toHaveFocus();
    });
  });

  describe('Form field navigation', () => {
    it('tabs through form fields in order', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(
        <form>
          <div>
            <Label htmlFor="first">First</Label>
            <Input id="first" />
          </div>
          <div>
            <Label htmlFor="second">Second</Label>
            <Input id="second" />
          </div>
          <Button type="submit">Submit</Button>
        </form>,
      );

      await user.tab();
      expect(getByLabelText('First')).toHaveFocus();

      await user.tab();
      expect(getByLabelText('Second')).toHaveFocus();
    });

    it('shift+tab navigates backwards', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(
        <form>
          <div>
            <Label htmlFor="field-a">Field A</Label>
            <Input id="field-a" />
          </div>
          <div>
            <Label htmlFor="field-b">Field B</Label>
            <Input id="field-b" />
          </div>
        </form>,
      );

      await user.tab();
      await user.tab();
      expect(getByLabelText('Field B')).toHaveFocus();

      await user.tab({ shift: true });
      expect(getByLabelText('Field A')).toHaveFocus();
    });
  });

  describe('Multiple button navigation', () => {
    it('tabs through multiple buttons', async () => {
      const user = userEvent.setup();
      const { getByText } = render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>,
      );

      await user.tab();
      expect(getByText('First')).toHaveFocus();

      await user.tab();
      expect(getByText('Second')).toHaveFocus();

      await user.tab();
      expect(getByText('Third')).toHaveFocus();
    });
  });

  describe('Alert accessibility', () => {
    it('alert content is accessible to screen readers', () => {
      const { getByRole } = render(
        <Alert variant="destructive">
          <AlertTitle>Error occurred</AlertTitle>
          <AlertDescription>Please try again later</AlertDescription>
        </Alert>,
      );

      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Error occurred');
      expect(alert).toHaveTextContent('Please try again later');
    });
  });
});
