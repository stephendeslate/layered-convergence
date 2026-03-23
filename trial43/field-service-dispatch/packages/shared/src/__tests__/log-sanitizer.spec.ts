// TRACED: FD-LOG-SANITIZER-TEST
import { sanitizeLogContext } from '../log-sanitizer';
import { formatLogEntry } from '../log-format';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const context = { email: 'user@test.com', password: 'secret123' };
    const result = sanitizeLogContext(context);
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('user@test.com');
  });

  it('should redact passwordHash fields', () => {
    const context = { passwordHash: '$2b$12$hash' };
    const result = sanitizeLogContext(context);
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should redact token fields', () => {
    const context = { token: 'jwt-token-value', userId: '123' };
    const result = sanitizeLogContext(context);
    expect(result.token).toBe('[REDACTED]');
    expect(result.userId).toBe('123');
  });

  it('should redact accessToken fields', () => {
    const context = { accessToken: 'bearer-token' };
    const result = sanitizeLogContext(context);
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const context = { secret: 'my-secret-key' };
    const result = sanitizeLogContext(context);
    expect(result.secret).toBe('[REDACTED]');
  });

  it('should redact authorization fields', () => {
    const context = { authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(context);
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('should be case-insensitive for key matching', () => {
    const context = {
      Password: 'secret',
      TOKEN: 'value',
      Authorization: 'Bearer abc',
    };
    const result = sanitizeLogContext(context);
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should perform deep sanitization on nested objects', () => {
    const context = {
      user: {
        email: 'test@test.com',
        password: 'hidden',
        profile: {
          name: 'Test',
          token: 'nested-token',
        },
      },
    };
    const result = sanitizeLogContext(context);
    const user = result.user as Record<string, unknown>;
    expect(user.email).toBe('test@test.com');
    expect(user.password).toBe('[REDACTED]');
    const profile = user.profile as Record<string, unknown>;
    expect(profile.name).toBe('Test');
    expect(profile.token).toBe('[REDACTED]');
  });

  it('should not modify non-sensitive fields', () => {
    const context = {
      method: 'POST',
      url: '/auth/login',
      statusCode: 200,
      correlationId: 'abc-123',
    };
    const result = sanitizeLogContext(context);
    expect(result).toEqual(context);
  });

  it('should handle arrays without deep-sanitizing them', () => {
    const context = { tags: ['a', 'b'], password: 'secret' };
    const result = sanitizeLogContext(context);
    expect(result.tags).toEqual(['a', 'b']);
    expect(result.password).toBe('[REDACTED]');
  });

  it('should handle null values', () => {
    const context = { value: null, password: 'secret' };
    const result = sanitizeLogContext(context);
    expect(result.value).toBeNull();
    expect(result.password).toBe('[REDACTED]');
  });
});

describe('formatLogEntry with sanitization', () => {
  it('should sanitize context in formatted log entries', () => {
    const result = formatLogEntry('info', 'User login', {
      email: 'test@test.com',
      password: 'secret123',
    });
    const parsed = JSON.parse(result);
    expect(parsed.password).toBe('[REDACTED]');
    expect(parsed.email).toBe('test@test.com');
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('User login');
  });

  it('should include timestamp in formatted entries', () => {
    const result = formatLogEntry('error', 'Failed', {});
    const parsed = JSON.parse(result);
    expect(parsed.timestamp).toBeDefined();
  });
});
