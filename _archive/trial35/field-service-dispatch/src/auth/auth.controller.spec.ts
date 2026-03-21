import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    service = {
      register: vi.fn(),
      login: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register on auth service', async () => {
    const dto = { email: 'test@test.com', password: 'pass123', name: 'Test', companyId: 'c1' };
    service.register.mockResolvedValue({ accessToken: 'token', user: {} });
    const result = await controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result.accessToken).toBe('token');
  });

  it('should call login on auth service', async () => {
    const dto = { email: 'test@test.com', password: 'pass123' };
    service.login.mockResolvedValue({ accessToken: 'token', user: {} });
    const result = await controller.login(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result.accessToken).toBe('token');
  });
});
