/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert } from '../components/ui/alert';
import { Table } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { truncateText, slugify, formatCurrency } from '@escrow-marketplace/shared';

// TRACED: EM-TEST-004 — Page rendering and shared utility tests

describe('Page Components', () => {
  it('should render homepage hero section', () => {
    const { container } = render(
      <div className="space-y-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Escrow Marketplace</h1>
          <p className="text-lg text-gray-600">
            {truncateText('Buy and sell with confidence through secure escrow transactions', 50)}
          </p>
        </section>
        <Button>Browse Listings</Button>
      </div>,
    );

    expect(container.querySelector('h1')).toBeTruthy();
    expect(screen.getByText('Browse Listings')).toBeTruthy();
  });

  it('should render listing cards with truncated descriptions', () => {
    const description = 'A beautiful vintage timepiece in excellent condition with original box and papers';
    const truncated = truncateText(description, 40);

    const { container } = render(
      <Card className="p-4">
        <h3 className="font-semibold">Vintage Watch</h3>
        <p>{truncated}</p>
        <Badge variant="default">ACTIVE</Badge>
      </Card>,
    );

    expect(truncated.length).toBeLessThanOrEqual(40);
    expect(container.querySelector('h3')).toBeTruthy();
  });

  it('should render transaction table', () => {
    const { container } = render(
      <Table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{formatCurrency('75.00')}</td>
            <td><Badge>COMPLETED</Badge></td>
          </tr>
        </tbody>
      </Table>,
    );

    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelector('thead')).toBeTruthy();
  });

  it('should render loading skeleton', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <Skeleton className="h-12 w-48" />
        <span className="sr-only">Loading...</span>
      </div>,
    );

    expect(container.querySelector('[role="status"]')).toBeTruthy();
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('should render error alert with retry', () => {
    const reset = jest.fn();
    const { container } = render(
      <Alert variant="destructive">
        <h2>Something went wrong</h2>
        <p>Error message here</p>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </Alert>,
    );

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('should generate correct slugs for listing titles', () => {
    expect(slugify('Vintage Watch')).toBe('vintage-watch');
    expect(slugify('Art Print Collection!')).toBe('art-print-collection');
    expect(slugify('   Leather  Bag   ')).toBe('leather-bag');
  });

  it('should truncate text with custom suffix', () => {
    const result = truncateText('This is a long description', 15, '...');
    expect(result.length).toBeLessThanOrEqual(15);
    expect(result).toContain('...');
  });

  it('should not truncate short text', () => {
    const result = truncateText('Short', 10);
    expect(result).toBe('Short');
  });

  it('should format currency values correctly', () => {
    expect(formatCurrency('299.99')).toContain('299.99');
    expect(formatCurrency(75)).toContain('75');
  });
});
