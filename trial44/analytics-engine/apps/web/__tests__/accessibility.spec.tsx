/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// TRACED:AE-TEST-009
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/dynamic', () => {
  return function dynamic(loader: () => Promise<{ default: React.ComponentType }>) {
    const { useEffect, useState } = require('react');
    return function DynamicComponent(props: Record<string, unknown>) {
      const [Component, setComponent] = useState<React.ComponentType | null>(null);
      useEffect(() => {
        loader().then((mod: { default: React.ComponentType }) => setComponent(() => mod.default));
      }, []);
      if (!Component) return null;
      return <Component {...props} />;
    };
  };
});

describe('Accessibility', () => {
  it('should have no accessibility violations in Nav component', async () => {
    const { Nav } = await import('@/components/nav');
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in login form', async () => {
    const LoginPage = (await import('@/app/login/page')).default;
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in Alert component', async () => {
    const { Alert, AlertTitle, AlertDescription } = await import('@/components/ui/alert');
    const { container } = render(
      <Alert>
        <AlertTitle>Test</AlertTitle>
        <AlertDescription>Test description</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in Button component', async () => {
    const { Button } = await import('@/components/ui/button');
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in Table component', async () => {
    const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = await import(
      '@/components/ui/table'
    );
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
