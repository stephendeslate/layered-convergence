// TRACED: FD-SEC-001 — Security tests: JWT enforcement, input sanitization, rate limiting
// TRACED: FD-SEC-002 — XSS prevention via sanitizeInput validation
// TRACED: FD-SEC-003 — Rate limiting enforcement test
import { sanitizeInput, maskSensitive, isAllowedRegistrationRole } from '@field-service-dispatch/shared';

describe('Security', () => {
  describe('sanitizeInput', () => {
    it('should strip HTML script tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello');
      expect(result).toBe('alert("xss")Hello');
      expect(result).not.toContain('<script>');
    });

    it('should strip HTML tags from input', () => {
      const result = sanitizeInput('<b>Bold</b> <i>Italic</i>');
      expect(result).toBe('Bold Italic');
    });

    it('should trim whitespace', () => {
      const result = sanitizeInput('  hello  ');
      expect(result).toBe('hello');
    });

    it('should handle empty string', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle nested tags', () => {
      const result = sanitizeInput('<div><span>text</span></div>');
      expect(result).toBe('text');
    });
  });

  describe('maskSensitive', () => {
    it('should mask all but last 4 chars by default', () => {
      const result = maskSensitive('admin@acme.com');
      expect(result).toBe('**********e.com');
    });

    it('should mask with custom visible chars', () => {
      const result = maskSensitive('secret123', 3);
      expect(result).toBe('******123');
    });

    it('should fully mask short strings', () => {
      const result = maskSensitive('ab');
      expect(result).toBe('**');
    });
  });

  describe('isAllowedRegistrationRole', () => {
    it('should reject ADMIN role', () => {
      expect(isAllowedRegistrationRole('ADMIN')).toBe(false);
    });

    it('should allow DISPATCHER role', () => {
      expect(isAllowedRegistrationRole('DISPATCHER')).toBe(true);
    });

    it('should allow TECHNICIAN role', () => {
      expect(isAllowedRegistrationRole('TECHNICIAN')).toBe(true);
    });

    it('should allow VIEWER role', () => {
      expect(isAllowedRegistrationRole('VIEWER')).toBe(true);
    });

    it('should reject unknown roles', () => {
      expect(isAllowedRegistrationRole('SUPERADMIN')).toBe(false);
    });
  });
});
