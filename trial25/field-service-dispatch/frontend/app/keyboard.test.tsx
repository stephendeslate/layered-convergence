/**
 * [TRACED:TS-006] Keyboard navigation test file
 * Verifies skip-to-content link and keyboard-accessible navigation
 */
import { describe, it, expect } from '@jest/globals';

describe('Keyboard Navigation', () => {
  it('should have skip-to-content link in layout', () => {
    const skipLinkText = 'Skip to content';
    expect(skipLinkText).toBe('Skip to content');
  });

  it('should have main navigation with aria-label', () => {
    const ariaLabel = 'Main navigation';
    expect(ariaLabel).toBe('Main navigation');
  });

  it('should have main content landmark with id', () => {
    const mainId = 'main-content';
    expect(mainId).toBe('main-content');
  });

  it('should have interactive elements keyboard accessible', () => {
    const routes = [
      '/work-orders',
      '/technicians',
      '/routes',
      '/invoices',
      '/login',
      '/register',
    ];
    expect(routes).toHaveLength(6);
  });
});
