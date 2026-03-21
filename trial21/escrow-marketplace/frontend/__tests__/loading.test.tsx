import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RootLoading from '../app/loading';
import LoginLoading from '../app/login/loading';
import RegisterLoading from '../app/register/loading';
import TransactionsLoading from '../app/transactions/loading';
import DisputesLoading from '../app/disputes/loading';
import PayoutsLoading from '../app/payouts/loading';
import WebhooksLoading from '../app/webhooks/loading';

expect.extend(toHaveNoViolations);

describe('Loading Components', () => {
  const loadingComponents = [
    { name: 'RootLoading', Component: RootLoading },
    { name: 'LoginLoading', Component: LoginLoading },
    { name: 'RegisterLoading', Component: RegisterLoading },
    { name: 'TransactionsLoading', Component: TransactionsLoading },
    { name: 'DisputesLoading', Component: DisputesLoading },
    { name: 'PayoutsLoading', Component: PayoutsLoading },
    { name: 'WebhooksLoading', Component: WebhooksLoading },
  ];

  loadingComponents.forEach(({ name, Component }) => {
    describe(name, () => {
      it('renders with role="status" and aria-busy="true"', () => {
        render(<Component />);
        const statusEl = screen.getByRole('status');
        expect(statusEl).toBeInTheDocument();
        expect(statusEl).toHaveAttribute('aria-busy', 'true');
      });

      it('has no accessibility violations', async () => {
        const { container } = render(<Component />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
