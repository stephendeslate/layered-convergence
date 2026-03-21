import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      register: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with email and password', async () => {
      const dto = { email: 'test@example.com', password: 'password1' };
      authService.login.mockResolvedValue({ accessToken: 'token', user: {} });

      await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password1');
    });

    it('should return the login result', async () => {
      const expected = { accessToken: 'token', user: { id: '1' } };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login({ email: 'test@example.com', password: 'password1' });

      expect(result).toEqual(expected);
    });
  });

  describe('register', () => {
    it('should call authService.register with dto fields', async () => {
      const dto = { email: 'new@example.com', password: 'password1', organizationId: 'org-1' };
      authService.register.mockResolvedValue({ accessToken: 'token', user: {} });

      await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith('new@example.com', 'password1', 'org-1');
    });

    it('should return the register result', async () => {
      const expected = { accessToken: 'token', user: { id: '2' } };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register({
        email: 'new@example.com',
        password: 'password1',
        organizationId: 'org-1',
      });

      expect(result).toEqual(expected);
    });
  });
});
