import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  register: vi.fn(),
  login: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(mockService as any);
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = { email: 'test@test.com', password: 'password123', name: 'Test' };
      mockService.register.mockResolvedValue({ user: { id: '1' }, token: 'jwt' });

      const result = await controller.register(dto);
      expect(result.token).toBe('jwt');
      expect(mockService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      mockService.login.mockResolvedValue({ user: { id: '1' }, token: 'jwt' });

      const result = await controller.login(dto);
      expect(result.token).toBe('jwt');
      expect(mockService.login).toHaveBeenCalledWith(dto);
    });
  });
});
