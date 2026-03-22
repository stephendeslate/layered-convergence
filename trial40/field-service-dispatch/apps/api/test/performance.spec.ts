// TRACED: FD-PERF-003 — Performance tests: timeout, pagination, response time
// TRACED: FD-PERF-006 — Pagination size capping validation
// TRACED: FD-PERF-008 — Bundle optimization verification
import {
  withTimeout,
  TimeoutError,
  normalizePageParams,
  paginate,
  MAX_PAGE_SIZE,
  formatBytes,
  truncateText,
} from '@field-service-dispatch/shared';

describe('Performance', () => {
  describe('withTimeout', () => {
    it('should resolve before timeout', async () => {
      const result = await withTimeout(
        () => Promise.resolve('done'),
        1000,
      );
      expect(result).toBe('done');
    });

    it('should reject on timeout', async () => {
      await expect(
        withTimeout(
          () => new Promise((resolve) => setTimeout(resolve, 2000)),
          50,
        ),
      ).rejects.toThrow(TimeoutError);
    });

    it('should propagate async errors', async () => {
      await expect(
        withTimeout(
          () => Promise.reject(new Error('boom')),
          1000,
        ),
      ).rejects.toThrow('boom');
    });
  });

  describe('normalizePageParams', () => {
    it('should default negative page to 1', () => {
      const { page } = normalizePageParams(-5, 20);
      expect(page).toBe(1);
    });

    it('should cap pageSize at MAX_PAGE_SIZE', () => {
      const { pageSize } = normalizePageParams(1, 500);
      expect(pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should default zero page to 1', () => {
      const { page } = normalizePageParams(0, 20);
      expect(page).toBe(1);
    });

    it('should floor decimal page numbers', () => {
      const { page } = normalizePageParams(2.7, 20);
      expect(page).toBe(2);
    });

    it('should handle NaN gracefully', () => {
      const { page, pageSize } = normalizePageParams(NaN, NaN);
      expect(page).toBe(1);
      expect(pageSize).toBe(1);
    });
  });

  describe('paginate', () => {
    it('should calculate totalPages correctly', () => {
      const result = paginate([1, 2, 3], 25, 1, 10);
      expect(result.totalPages).toBe(3);
      expect(result.total).toBe(25);
    });

    it('should handle empty results', () => {
      const result = paginate([], 0, 1, 20);
      expect(result.totalPages).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });

    it('should truncate long text with ellipsis', () => {
      const result = truncateText('This is a very long sentence', 15);
      expect(result.length).toBeLessThanOrEqual(15);
      expect(result).toContain('...');
    });

    it('should use custom suffix', () => {
      const result = truncateText('abcdefghij', 7, '~');
      expect(result).toBe('abcdef~');
    });
  });
});
