import {
  formatCurrency,
  truncateText,
  slugify,
  sanitizeInput,
  maskSensitive,
  clampPageSize,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@escrow-marketplace/shared';

// TRACED: EM-TEST-009 — Page-level tests with shared utility validation

describe('Shared utilities used in pages', () => {
  describe('formatCurrency', () => {
    it('should format number to USD currency string', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency('1234.56')).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle string input', () => {
      expect(formatCurrency('42')).toBe('$42.00');
    });
  });

  describe('truncateText', () => {
    it('should truncate text exceeding maxLength', () => {
      expect(truncateText('Hello, World!', 8)).toBe('Hello...');
    });

    it('should not truncate text within limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should support custom suffix', () => {
      expect(truncateText('Hello, World!', 9, '--')).toBe('Hello, --');
    });
  });

  describe('slugify', () => {
    it('should create URL-safe slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special!@#Characters$')).toBe('specialcharacters');
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe(
        'alert("xss")Hello',
      );
      expect(sanitizeInput('<b>Bold</b>')).toBe('Bold');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('maskSensitive', () => {
    it('should mask all but last N characters', () => {
      expect(maskSensitive('test@example.com', 4)).toBe('************.com');
    });

    it('should mask entirely if value is shorter than visibleChars', () => {
      expect(maskSensitive('hi', 4)).toBe('**');
    });
  });

  describe('clampPageSize', () => {
    it('should clamp to MAX_PAGE_SIZE', () => {
      expect(clampPageSize(200)).toBe(MAX_PAGE_SIZE);
    });

    it('should return DEFAULT_PAGE_SIZE for invalid values', () => {
      expect(clampPageSize(0)).toBe(DEFAULT_PAGE_SIZE);
      expect(clampPageSize(-5)).toBe(DEFAULT_PAGE_SIZE);
    });

    it('should pass through valid values', () => {
      expect(clampPageSize(50)).toBe(50);
    });
  });
});
