/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

import { Nav } from '../components/nav';

describe('Pages', () => {
  describe('Nav', () => {
    it('should render navigation links', () => {
      render(<Nav />);

      expect(screen.getByText('Escrow Marketplace')).toBeDefined();
      expect(screen.getByText('Listings')).toBeDefined();
      expect(screen.getByText('Transactions')).toBeDefined();
      expect(screen.getByText('Escrow')).toBeDefined();
    });

    it('should have correct hrefs', () => {
      render(<Nav />);

      const listingsLink = screen.getByText('Listings');
      expect(listingsLink.closest('a')).toHaveAttribute('href', '/listings');

      const transactionsLink = screen.getByText('Transactions');
      expect(transactionsLink.closest('a')).toHaveAttribute(
        'href',
        '/transactions',
      );

      const escrowLink = screen.getByText('Escrow');
      expect(escrowLink.closest('a')).toHaveAttribute('href', '/escrow');
    });

    it('should have navigation landmark', () => {
      render(<Nav />);
      expect(screen.getByRole('navigation')).toBeDefined();
    });
  });
});
