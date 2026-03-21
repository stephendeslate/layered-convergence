import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRole } from '../../generated/prisma/client.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: 'pass123', role: UserRole.BUYER };
      const expected = { id: '1', email: 'test@example.com', token: 'tok' };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);
      expect(result).toEqual(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password', async () => {
      const dto = { email: 'test@example.com', password: 'pass123' };
      const expected = { id: '1', email: 'test@example.com', token: 'tok' };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);
      expect(result).toEqual(expected);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'pass123');
    });
  });
});
