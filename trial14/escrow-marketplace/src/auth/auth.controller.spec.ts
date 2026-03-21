import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
    };
    controller = new AuthController(authService as any);
  });

  describe('register', () => {
    it('should delegate to authService.register', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER' as const,
        password: 'password123',
      };
      const expected = { id: 'user-1', email: dto.email, token: 'abc' };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = { id: 'user-1', email: dto.email, token: 'abc' };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
