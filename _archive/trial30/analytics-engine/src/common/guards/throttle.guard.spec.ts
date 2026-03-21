import { describe, it, expect } from 'vitest';
import { ThrottleGuard } from './throttle.guard';

function createMockContext(ip = '127.0.0.1') {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip, headers: {} }),
    }),
  } as any;
}

describe('ThrottleGuard', () => {
  it('should allow first request', () => {
    const guard = new ThrottleGuard(100, 60000);
    expect(guard.canActivate(createMockContext())).toBe(true);
  });

  it('should allow requests within limit', () => {
    const guard = new ThrottleGuard(5, 60000);
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(createMockContext())).toBe(true);
    }
  });

  it('should block requests exceeding limit', () => {
    const guard = new ThrottleGuard(2, 60000);
    guard.canActivate(createMockContext());
    guard.canActivate(createMockContext());
    expect(() => guard.canActivate(createMockContext())).toThrow('Too many requests');
  });

  it('should track different IPs separately', () => {
    const guard = new ThrottleGuard(1, 60000);
    expect(guard.canActivate(createMockContext('1.1.1.1'))).toBe(true);
    expect(guard.canActivate(createMockContext('2.2.2.2'))).toBe(true);
  });

  it('should use default values', () => {
    const guard = new ThrottleGuard();
    expect(guard.canActivate(createMockContext())).toBe(true);
  });
});
