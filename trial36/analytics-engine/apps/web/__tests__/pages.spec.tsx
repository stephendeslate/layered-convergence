import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

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

describe('Pages', () => {
  describe('HomePage', () => {
    it('should render the main heading', () => {
      render(<HomePage />);
      expect(screen.getByText('Analytics Engine')).toBeInTheDocument();
    });

    it('should render feature cards for all sections', () => {
      render(<HomePage />);
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByText('Pipelines')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should have links to each section', () => {
      render(<HomePage />);
      const links = screen.getAllByRole('link');
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('/dashboards');
      expect(hrefs).toContain('/pipelines');
      expect(hrefs).toContain('/reports');
    });

    it('should render badges with Available status', () => {
      render(<HomePage />);
      const badges = screen.getAllByText('Available');
      expect(badges).toHaveLength(3);
    });
  });
});
