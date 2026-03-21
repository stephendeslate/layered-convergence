import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = { get: vi.fn().mockReturnValue('test-secret') } as any;
    strategy = new JwtStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from payload', () => {
      const payload = { sub: 'user-1', email: 'test@test.com', role: 'BUYER' };
      const result = strategy.validate(payload);
      expect(result).toEqual({ id: 'user-1', email: 'test@test.com', role: 'BUYER' });
    });

    it('should map sub to id', () => {
      const payload = { sub: 'abc-123', email: 'a@b.com', role: 'PROVIDER' };
      const result = strategy.validate(payload);
      expect(result.id).toBe('abc-123');
    });
  });
});
