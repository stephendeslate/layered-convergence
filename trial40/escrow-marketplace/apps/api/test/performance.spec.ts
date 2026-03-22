// TRACED: EM-TEST-007 — Performance tests for L7 features
import { normalizePageParams, withTimeout, TimeoutError, MAX_PAGE_SIZE } from '@escrow-marketplace/shared';

describe('Performance', () => {
  describe('normalizePageParams', () => {
    it('should clamp page to minimum of 1', () => {
      const result = normalizePageParams(0, 20);
      expect(result.page).toBe(1);
    });

    it('should clamp pageSize to MAX_PAGE_SIZE', () => {
      const result = normalizePageParams(1, 500);
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should normalize negative page values', () => {
      const result = normalizePageParams(-5, 20);
      expect(result.page).toBe(1);
    });

    it('should normalize negative pageSize values', () => {
      const result = normalizePageParams(1, -10);
      expect(result.pageSize).toBeGreaterThanOrEqual(1);
    });

    it('should pass through valid values', () => {
      const result = normalizePageParams(3, 50);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
    });
  });

  describe('withTimeout', () => {
    it('should resolve if function completes within timeout', async () => {
      const result = await withTimeout(() => Promise.resolve('ok'), 1000);
      expect(result).toBe('ok');
    });

    it('should reject with TimeoutError if function exceeds timeout', async () => {
      await expect(
        withTimeout(
          () => new Promise((resolve) => setTimeout(resolve, 500)),
          10,
        ),
      ).rejects.toThrow(TimeoutError);
    });

    it('should propagate errors from the wrapped function', async () => {
      await expect(
        withTimeout(
          () => Promise.reject(new Error('inner error')),
          1000,
        ),
      ).rejects.toThrow('inner error');
    });
  });

  describe('ResponseTimeInterceptor', () => {
    it('should export MAX_PAGE_SIZE as 100', () => {
      expect(MAX_PAGE_SIZE).toBe(100);
    });
  });
});
