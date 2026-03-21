import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from '@/components/transactions/transition-buttons';

expect.extend(toHaveNoViolations);

jest.mock('@/app/actions', () => ({
  transitionTransaction: jest.fn().mockResolvedValue(undefined),
}));

describe('TransitionButtons', () => {
  // --- PENDING status ---
  describe('PENDING status', () => {
    it('should render fund button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /fund escrow/i }),
      ).toBeInTheDocument();
    });

    it('should render cancel button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it('should render cancel button for seller', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="SELLER"
          isBuyer={false}
          isSeller={true}
        />,
      );
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it('should render cancel button for admin', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it('should NOT render fund button for seller', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="SELLER"
          isBuyer={false}
          isSeller={true}
        />,
      );
      expect(
        screen.queryByRole('button', { name: /fund escrow/i }),
      ).not.toBeInTheDocument();
    });
  });

  // --- FUNDED status ---
  describe('FUNDED status', () => {
    it('should render ship button for seller', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="FUNDED"
          userRole="SELLER"
          isBuyer={false}
          isSeller={true}
        />,
      );
      expect(
        screen.getByRole('button', { name: /mark shipped/i }),
      ).toBeInTheDocument();
    });

    it('should render dispute button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="FUNDED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /open dispute/i }),
      ).toBeInTheDocument();
    });

    it('should render dispute button for seller', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="FUNDED"
          userRole="SELLER"
          isBuyer={false}
          isSeller={true}
        />,
      );
      expect(
        screen.getByRole('button', { name: /open dispute/i }),
      ).toBeInTheDocument();
    });

    it('should render cancel button for seller on FUNDED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="FUNDED"
          userRole="SELLER"
          isBuyer={false}
          isSeller={true}
        />,
      );
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });

  // --- SHIPPED status ---
  describe('SHIPPED status', () => {
    it('should render delivery button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="SHIPPED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /confirm delivery/i }),
      ).toBeInTheDocument();
    });

    it('should render dispute button for buyer on SHIPPED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="SHIPPED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /open dispute/i }),
      ).toBeInTheDocument();
    });

    it('should NOT render ship button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="SHIPPED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.queryByRole('button', { name: /mark shipped/i }),
      ).not.toBeInTheDocument();
    });
  });

  // --- DELIVERED status ---
  describe('DELIVERED status', () => {
    it('should render release button for buyer', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="DELIVERED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /release funds/i }),
      ).toBeInTheDocument();
    });

    it('should render release button for admin', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="DELIVERED"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /release funds/i }),
      ).toBeInTheDocument();
    });

    it('should render dispute button for buyer on DELIVERED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="DELIVERED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /open dispute/i }),
      ).toBeInTheDocument();
    });
  });

  // --- DISPUTED status ---
  describe('DISPUTED status', () => {
    it('should render resolve button for admin', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="DISPUTED"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /resolve dispute/i }),
      ).toBeInTheDocument();
    });

    it('should show no actions for buyer on DISPUTED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="DISPUTED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });
  });

  // --- RESOLVED status ---
  describe('RESOLVED status', () => {
    it('should render release and refund buttons for admin', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="RESOLVED"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(
        screen.getByRole('button', { name: /release funds/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /issue refund/i }),
      ).toBeInTheDocument();
    });

    it('should show no actions for buyer on RESOLVED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="RESOLVED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });
  });

  // --- Terminal statuses ---
  describe('terminal statuses', () => {
    it('should show no actions for RELEASED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="RELEASED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });

    it('should show no actions for CANCELLED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="CANCELLED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });

    it('should show no actions for REFUNDED', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="REFUNDED"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });
  });

  // --- Non-participant ---
  describe('non-participant access', () => {
    it('should show no actions for non-participant on PENDING', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={false}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('no-actions')).toBeInTheDocument();
    });
  });

  // --- Form structure ---
  describe('form structure', () => {
    it('should render forms with hidden transactionId input', () => {
      render(
        <TransitionButtons
          transactionId="txn-abc"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      const container = screen.getByTestId('transition-buttons');
      const forms = container.querySelectorAll('form');
      expect(forms.length).toBeGreaterThan(0);
      forms.forEach((form) => {
        const hiddenInput = form.querySelector('input[name="transactionId"]');
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput).toHaveValue('txn-abc');
      });
    });

    it('should render forms with hidden targetStatus input', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      const container = screen.getByTestId('transition-buttons');
      const forms = container.querySelectorAll('form');
      forms.forEach((form) => {
        const statusInput = form.querySelector('input[name="targetStatus"]');
        expect(statusInput).not.toBeNull();
      });
    });

    it('should have submit buttons with aria-labels', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should use data-testid on each transition button', () => {
      render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      expect(screen.getByTestId('transition-funded')).toBeInTheDocument();
      expect(screen.getByTestId('transition-cancelled')).toBeInTheDocument();
    });
  });

  // --- Accessibility ---
  describe('accessibility', () => {
    it('should have no accessibility violations with buttons visible', async () => {
      const { container } = render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="PENDING"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with no actions', async () => {
      const { container } = render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="RELEASED"
          userRole="BUYER"
          isBuyer={true}
          isSeller={false}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for admin RESOLVED view', async () => {
      const { container } = render(
        <TransitionButtons
          transactionId="txn-1"
          currentStatus="RESOLVED"
          userRole="ADMIN"
          isBuyer={false}
          isSeller={false}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
