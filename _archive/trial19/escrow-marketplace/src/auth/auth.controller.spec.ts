import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: any; login: any };

  beforeEach(async () => {
    service = {
      register: vi.fn(),
      login: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('register', () => {
    it('should call service.register with dto', async () => {
      const dto = { email: 'a@b.com', password: 'pw1234', role: 'BUYER' as any };
      service.register.mockResolvedValue({ id: '1', ...dto, token: 'tok' });

      const result = await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('1');
    });

    it('should return the service response', async () => {
      const expected = { id: '2', email: 'x@y.com', role: 'PROVIDER', token: 'abc' };
      service.register.mockResolvedValue(expected);

      const result = await controller.register({
        email: 'x@y.com',
        password: 'pass12',
        role: 'PROVIDER' as any,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call service.login with dto', async () => {
      const dto = { email: 'a@b.com', password: 'pw1234' };
      service.login.mockResolvedValue({ id: '1', ...dto, token: 'tok' });

      await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('should return the token from service', async () => {
      service.login.mockResolvedValue({ token: 'my-token' });

      const result = await controller.login({ email: 'a@b.com', password: 'pass' });
      expect(result.token).toBe('my-token');
    });
  });
});
