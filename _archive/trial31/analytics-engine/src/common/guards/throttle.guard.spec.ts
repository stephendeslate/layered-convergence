import { HttpException } from '@nestjs/common';
import { ThrottleGuard } from './throttle.guard';

function createMockContext(ip: string = '127.0.0.1') {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip, headers: {} }),
    }),
  };
}

describe('ThrottleGuard', () => {
  it('should allow first request', () => {
    const guard = new ThrottleGuard(100, 60000);
    const result = guard.canActivate(createMockContext() as any);
    expect(result).toBe(true);
  });

  it('should allow multiple requests under limit', () => {
    const guard = new ThrottleGuard(5, 60000);
    const ctx = createMockContext();
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(ctx as any)).toBe(true);
    }
  });

  it('should reject request over limit', () => {
    const guard = new ThrottleGuard(2, 60000);
    const ctx = createMockContext();
    guard.canActivate(ctx as any);
    guard.canActivate(ctx as any);
    expect(() => guard.canActivate(ctx as any)).toThrow(HttpException);
  });

  it('should track different IPs separately', () => {
    const guard = new ThrottleGuard(1, 60000);
    expect(guard.canActivate(createMockContext('1.1.1.1') as any)).toBe(true);
    expect(guard.canActivate(createMockContext('2.2.2.2') as any)).toBe(true);
  });

  it('should use default limit and window', () => {
    const guard = new ThrottleGuard();
    expect(guard.canActivate(createMockContext() as any)).toBe(true);
  });
});
