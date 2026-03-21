import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';

const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(mockAuthService as any);
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = { email: 'test@test.com', password: 'password123', name: 'Test' };
      mockAuthService.register.mockResolvedValue({ user: { id: '1' }, token: 'tok' });

      const result = await controller.register(dto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('token');
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({ user: { id: '1' }, token: 'tok' });

      const result = await controller.login(dto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('token');
    });
  });
});
