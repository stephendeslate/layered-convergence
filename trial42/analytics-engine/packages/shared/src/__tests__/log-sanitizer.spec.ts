import { sanitizeLogContext } from '../log-sanitizer';

// TRACED:AE-MON-012
describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact token field', () => {
    const input = { userId: '1', token: 'jwt-token-value' };
    const result = sanitizeLogContext(input);
    expect(result.userId).toBe('1');
    expect(result.token).toBe('[REDACTED]');
  });

  it('should redact accessToken field', () => {
    const input = { accessToken: 'bearer-token' };
    const result = sanitizeLogContext(input);
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact secret field', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result.secret).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact authorization field', () => {
    const input = { authorization: 'Bearer abc123' };
    const result = sanitizeLogContext(input);
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$hash' };
    const result = sanitizeLogContext(input);
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should be case-insensitive', () => {
    const input = { PASSWORD: 'secret', Token: 'abc', SECRET: 'xyz' };
    const result = sanitizeLogContext(input);
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.SECRET).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        email: 'test@test.com',
        password: 'secret',
        profile: {
          token: 'nested-token',
          name: 'John',
        },
      },
    };
    const result = sanitizeLogContext(input);
    const user = result.user as Record<string, unknown>;
    expect(user.email).toBe('test@test.com');
    expect(user.password).toBe('[REDACTED]');
    const profile = user.profile as Record<string, unknown>;
    expect(profile.token).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays with objects', () => {
    const input = {
      users: [
        { name: 'Alice', password: 'pass1' },
        { name: 'Bob', token: 'tok1' },
      ],
    };
    const result = sanitizeLogContext(input);
    const users = result.users as Record<string, unknown>[];
    expect(users[0].name).toBe('Alice');
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[1].name).toBe('Bob');
    expect(users[1].token).toBe('[REDACTED]');
  });

  it('should preserve non-sensitive fields', () => {
    const input = { id: 1, email: 'test@test.com', role: 'USER' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual(input);
  });

  it('should handle empty objects', () => {
    const result = sanitizeLogContext({});
    expect(result).toEqual({});
  });
});
