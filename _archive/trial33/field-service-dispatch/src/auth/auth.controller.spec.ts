import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(() => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      validateUser: vi.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        companyId: 'company-1',
      };
      const result = { user: { id: 'user-1' }, token: 'tok' };
      authService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = { user: { id: 'user-1' }, token: 'tok' };
      authService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('should call authService.validateUser with userId from request', async () => {
      const req = { user: { userId: 'user-1' } };
      const result = { id: 'user-1', email: 'test@example.com' };
      authService.validateUser.mockResolvedValue(result);

      expect(await controller.me(req)).toEqual(result);
      expect(authService.validateUser).toHaveBeenCalledWith('user-1');
    });
  });
});
