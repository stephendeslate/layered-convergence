import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  const mockAuthResponse = {
    accessToken: 'mock-token',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: Role.BUYER,
    },
  };

  beforeEach(() => {
    authService = {
      register: vi.fn().mockResolvedValue(mockAuthResponse),
      login: vi.fn().mockResolvedValue(mockAuthResponse),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('register', () => {
    it('should call authService.register with the DTO', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.BUYER,
      };

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return access token and user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.BUYER,
      };

      const result = await controller.register(dto);

      expect(result.accessToken).toBeDefined();
      expect(result.user).toBeDefined();
    });
  });

  describe('login', () => {
    it('should call authService.login with the DTO', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('me', () => {
    it('should return the current user payload', async () => {
      const userPayload = { sub: 'user-1', email: 'test@example.com', role: Role.BUYER };
      const result = await controller.me(userPayload);
      expect(result).toEqual({ user: userPayload });
    });
  });
});
