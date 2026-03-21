import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Loading from '@/app/loading';
import DataSourcesLoading from '@/app/data-sources/loading';
import DataSourceDetailLoading from '@/app/data-sources/[id]/loading';
import DashboardDetailLoading from '@/app/dashboards/[id]/loading';
import LoginLoading from '@/app/(auth)/login/loading';
import RegisterLoading from '@/app/(auth)/register/loading';

describe('Loading skeletons', () => {
  describe('Root loading', () => {
    it('should render skeleton elements', () => {
      const { container } = render(<Loading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<Loading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DataSources loading', () => {
    it('should render skeleton grid', () => {
      const { container } = render(<DataSourcesLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<DataSourcesLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DataSource detail loading', () => {
    it('should render skeleton for detail page', () => {
      const { container } = render(<DataSourceDetailLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<DataSourceDetailLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dashboard detail loading', () => {
    it('should render skeleton for dashboard detail', () => {
      const { container } = render(<DashboardDetailLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<DashboardDetailLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Login loading', () => {
    it('should render skeleton for login form', () => {
      const { container } = render(<LoginLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<LoginLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Register loading', () => {
    it('should render skeleton for register form', () => {
      const { container } = render(<RegisterLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<RegisterLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
