// TRACED: EM-ARCH-006 — Page component validation and shared utility tests
import {
  formatCurrency,
  truncateText,
  slugify,
  sanitizeInput,
  maskSensitive,
  normalizePageParams,
  withTimeout,
  TimeoutError,
  MAX_PAGE_SIZE,
} from '@escrow-marketplace/shared';

describe('Shared Utilities for Pages', () => {
  describe('formatCurrency', () => {
    it('should format number to USD currency string', () => {
      expect(formatCurrency(1250.50)).toBe('$1,250.50');
    });

    it('should format string amounts', () => {
      expect(formatCurrency('99.99')).toBe('$99.99');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text with default suffix', () => {
      const result = truncateText('This is a very long description text', 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('...');
    });

    it('should return original text when within limit', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('slugify', () => {
    it('should generate URL-safe slugs', () => {
      expect(slugify('Vintage Watch Collection')).toBe('vintage-watch-collection');
    });

    it('should strip special characters', () => {
      expect(slugify('Hello & World!')).toBe('hello--world');
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('maskSensitive', () => {
    it('should mask all but last 4 characters', () => {
      expect(maskSensitive('1234567890')).toBe('******7890');
    });

    it('should fully mask short strings', () => {
      expect(maskSensitive('ab')).toBe('**');
    });
  });

  describe('normalizePageParams', () => {
    it('should clamp excessive pageSize', () => {
      expect(normalizePageParams(1, 999).pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should enforce minimum page of 1', () => {
      expect(normalizePageParams(-5, 20).page).toBe(1);
    });
  });

  describe('withTimeout', () => {
    it('should resolve fast operations', async () => {
      const result = await withTimeout(() => Promise.resolve(42), 1000);
      expect(result).toBe(42);
    });

    it('should reject slow operations with TimeoutError', async () => {
      await expect(
        withTimeout(() => new Promise((r) => setTimeout(r, 500)), 10),
      ).rejects.toThrow(TimeoutError);
    });
  });
});
