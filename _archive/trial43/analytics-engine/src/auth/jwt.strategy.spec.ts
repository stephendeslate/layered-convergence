import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const mockConfig = {
      get: vi.fn().mockReturnValue('test-secret'),
    };
    strategy = new JwtStrategy(mockConfig as any);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user object from payload', () => {
    const payload = { sub: 'user-1', email: 'test@example.com', role: 'ADMIN', tenantId: 'tenant-1' };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  it('should map sub to id', () => {
    const payload = { sub: 'abc-123', email: 'a@b.com', role: 'USER' };
    const result = strategy.validate(payload);
    expect(result.id).toBe('abc-123');
  });
});
