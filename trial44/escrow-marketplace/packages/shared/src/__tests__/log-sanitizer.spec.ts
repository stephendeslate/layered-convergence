// TRACED: EM-LSANT-001
import { sanitizeLogContext } from '../log-sanitizer';
import { formatLogEntry } from '../log-format';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const context = { username: 'john', password: 'secret123' };
    const result = sanitizeLogContext(context);
    expect(result.username).toBe('john');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact token fields case-insensitively', () => {
    const context = { Token: 'abc', AccessToken: 'xyz' };
    const result = sanitizeLogContext(context);
    expect(result.Token).toBe('[REDACTED]');
    expect(result.AccessToken).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const context = { Authorization: 'Bearer abc123' };
    const result = sanitizeLogContext(context);
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const context = { secret: 'top-secret', name: 'test' };
    const result = sanitizeLogContext(context);
    expect(result.secret).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact passwordHash fields', () => {
    const context = { passwordHash: '$2b$12$hash', email: 'a@b.com' };
    const result = sanitizeLogContext(context);
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.email).toBe('a@b.com');
  });

  it('should handle deep nested objects', () => {
    const context = {
      user: {
        name: 'john',
        credentials: {
          password: 'secret',
          token: 'abc',
        },
      },
    };
    const result = sanitizeLogContext(context);
    const user = result.user as Record<string, unknown>;
    const creds = user.credentials as Record<string, unknown>;
    expect(creds.password).toBe('[REDACTED]');
    expect(creds.token).toBe('[REDACTED]');
    expect(user.name).toBe('john');
  });

  it('should leave non-sensitive fields unchanged', () => {
    const context = { status: 'ok', count: 42, active: true };
    const result = sanitizeLogContext(context);
    expect(result).toEqual({ status: 'ok', count: 42, active: true });
  });

  it('should handle empty objects', () => {
    const result = sanitizeLogContext({});
    expect(result).toEqual({});
  });

  it('should sanitize objects inside arrays', () => {
    const context = {
      users: [
        { name: 'john', password: 'secret' },
        { name: 'jane', token: 'abc123' },
      ],
    };
    const result = sanitizeLogContext(context);
    const users = result.users as Record<string, unknown>[];
    expect(users[0].name).toBe('john');
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[1].name).toBe('jane');
    expect(users[1].token).toBe('[REDACTED]');
  });

  it('should preserve primitive values in arrays', () => {
    const context = { tags: ['a', 'b', 'c'], ids: [1, 2, 3] };
    const result = sanitizeLogContext(context);
    expect(result.tags).toEqual(['a', 'b', 'c']);
    expect(result.ids).toEqual([1, 2, 3]);
  });
});

describe('formatLogEntry', () => {
  it('should produce valid JSON with sanitized context', () => {
    const entry = formatLogEntry('info', 'test message', {
      password: 'secret',
      user: 'john',
    });
    const parsed = JSON.parse(entry);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('test message');
    expect(parsed.context.password).toBe('[REDACTED]');
    expect(parsed.context.user).toBe('john');
    expect(parsed.timestamp).toBeDefined();
  });

  it('should work without context', () => {
    const entry = formatLogEntry('error', 'fail');
    const parsed = JSON.parse(entry);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('fail');
    expect(parsed.context).toBeUndefined();
  });
});
