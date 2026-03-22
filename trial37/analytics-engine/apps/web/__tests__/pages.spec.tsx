import React from 'react';
import { render, screen } from '@testing-library/react';
import { Nav } from '../components/nav';

describe('Pages and Navigation', () => {
  describe('Nav Component', () => {
    it('should render navigation with correct links', () => {
      render(<Nav />);

      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Dashboards')).toBeTruthy();
      expect(screen.getByText('Pipelines')).toBeTruthy();
      expect(screen.getByText('Reports')).toBeTruthy();
    });

    it('should render the AE brand name', () => {
      render(<Nav />);
      expect(screen.getByText('AE')).toBeTruthy();
    });

    it('should have navigation landmark', () => {
      render(<Nav />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should render links with correct hrefs', () => {
      render(<Nav />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink?.getAttribute('href')).toBe('/');

      const dashboardsLink = screen.getByText('Dashboards').closest('a');
      expect(dashboardsLink?.getAttribute('href')).toBe('/dashboards');

      const pipelinesLink = screen.getByText('Pipelines').closest('a');
      expect(pipelinesLink?.getAttribute('href')).toBe('/pipelines');

      const reportsLink = screen.getByText('Reports').closest('a');
      expect(reportsLink?.getAttribute('href')).toBe('/reports');
    });

    it('should accept and apply custom className', () => {
      const { container } = render(<Nav className="custom-class" />);
      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('custom-class');
    });

    it('should render navigation items in a list', () => {
      render(<Nav />);
      const list = screen.getByRole('list');
      expect(list).toBeTruthy();
      const items = list.querySelectorAll('li');
      expect(items.length).toBe(4);
    });
  });
});
